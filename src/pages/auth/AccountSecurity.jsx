import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  FiShield, FiKey, FiSmartphone, FiMail, FiCopy, FiRefreshCw,
  FiTrash2, FiCheckCircle, FiAlertCircle, FiLock, FiArrowRight,
  FiDownload, FiClock, FiShieldOff, FiExternalLink,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { API_URL } from "../../utils/apiBase";
import { startRegistration } from "@simplewebauthn/browser";
import DashboardLayout from "../../components/auth/DashboardLayout";

const api = async (path, body, method) => {
  const token = localStorage.getItem("altuvera_auth_token") || sessionStorage.getItem("altuvera_auth_token");
  const response = await fetch(`${API_URL}/users${path}`, {
    method: method || (body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) throw new Error(result.message || "Security request failed.");
  return result;
};

const Card = ({ icon: Icon, title, subtitle, status, children, tone = "default" }) => (
  <section className={`as-card ${tone === "danger" ? "as-card-danger" : ""}`}>
    <div className="as-card-head">
      <div className="as-icon"><Icon size={20} /></div>
      <div className="as-card-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {status && <span className={`as-status ${status.active ? "is-active" : ""}`}><span />{status.label}</span>}
    </div>
    <div className="as-card-body">{children}</div>
  </section>
);

const ActionButton = ({ children, variant = "primary", ...props }) => (
  <button className={`as-btn as-btn-${variant}`} type="button" {...props}>{children}</button>
);

export default function AccountSecurity() {
  const [status, setStatus] = useState(null);
  const [passkeys, setPasskeys] = useState([]);
  const [passkeyName, setPasskeyName] = useState("This device");
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryContactEmail, setRecoveryContactEmail] = useState("");
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [rotateCode, setRotateCode] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [factorsResult, passkeysResult] = await Promise.allSettled([
      api("/security/factors"),
      api("/security/passkeys"),
    ]);
    if (factorsResult.status === "fulfilled") setStatus(factorsResult.value.data || {});
    else setError(factorsResult.reason?.message || "Security status is temporarily unavailable.");
    if (passkeysResult.status === "fulfilled") setPasskeys(Array.isArray(passkeysResult.value.data) ? passkeysResult.value.data : []);
    else setError((current) => current || passkeysResult.reason?.message || "Passkeys are temporarily unavailable.");
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const run = async (fn) => {
    setBusy(true); setError(""); setMessage("");
    try { await fn(); }
    catch (e) { setError(e?.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };

  const copyText = async (text, successMessage) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement("textarea");
        area.value = text; area.setAttribute("readonly", ""); area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        const copiedOk = document.execCommand("copy"); area.remove();
        if (!copiedOk) throw new Error("Copy is not supported here. Please select and copy the text manually.");
      }
      setCopied(true); setMessage(successMessage || "Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch (e) { setError(e.message || "Could not copy. Please select and copy manually."); }
  };

  const addPasskey = () => run(async () => {
    if (!window.PublicKeyCredential || !navigator.credentials) throw new Error("Passkeys are not supported in this browser. Try a recent browser on HTTPS or use the authenticator and recovery-code options.");
    const options = await api("/security/passkeys/register/options", {});
    const response = await startRegistration({ optionsJSON: options.data || options });
    const saved = await api("/security/passkeys/register/verify", { response, deviceName: passkeyName.trim() || "This device" });
    setMessage(saved.message || "Passkey added successfully.");
    await refresh();
  });

  const requestRecovery = (e) => {
    e.preventDefault();
    return run(async () => {
      const response = await fetch(`${API_URL}/users/account-recovery/request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail.trim(), recoveryContactEmail: recoveryContactEmail.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || "Could not submit recovery request.");
      setRecoveryRequested(true);
      setMessage(data.message || "Your request has been submitted for review.");
    });
  };

  return (
    <>
      <Helmet>
        <title>Security & Recovery | Altuvera</title>
        <meta name="description" content="Manage Altuvera passkeys, authenticator verification, backup codes and account recovery." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <style>{`
        .as-page{width:100%;max-width:1180px;margin:0 auto;color:#0f172a;--as-green:#047857;--as-emerald:#059669}
        .as-page *{box-sizing:border-box}
        .as-hero{position:relative;overflow:hidden;border-radius:26px;padding:clamp(22px,4vw,38px);color:white;background:radial-gradient(circle at 85% 10%,rgba(167,243,208,.3),transparent 34%),linear-gradient(130deg,#064e3b 0%,#047857 58%,#059669 100%);box-shadow:0 18px 42px rgba(4,120,87,.18);margin-bottom:22px}
        .as-hero:after{content:"";position:absolute;width:220px;height:220px;border:1px solid rgba(255,255,255,.17);border-radius:50%;right:-70px;bottom:-130px;box-shadow:0 0 0 24px rgba(255,255,255,.035),0 0 0 50px rgba(255,255,255,.025);pointer-events:none}
        .as-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#d1fae5}
        .as-hero h1{font-size:clamp(28px,4.3vw,42px);line-height:1.08;letter-spacing:-.04em;font-weight:850;margin:12px 0 10px;color:#fff}
        .as-hero p{max-width:690px;margin:0;color:#d1fae5;font-size:clamp(13px,1.7vw,15px);line-height:1.7}
        .as-hero-bottom{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:22px}
        .as-trust-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.1);border-radius:999px;padding:8px 12px;font-size:12px;font-weight:650;color:#fff}
        .as-alert{display:flex;gap:10px;align-items:flex-start;border-radius:14px;padding:13px 15px;margin:0 0 16px;font-size:13px;line-height:1.5}
        .as-alert svg{flex-shrink:0;margin-top:1px}.as-alert-error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}.as-alert-success{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}
        .as-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:stretch}
        .as-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;min-width:0;box-shadow:0 5px 22px rgba(15,23,42,.035);transition:border-color .2s,box-shadow .2s}
        .as-card:hover{border-color:#cbd5e1;box-shadow:0 10px 28px rgba(15,23,42,.055)}
        .as-card-danger{border-color:#fee2e2}.as-card-head{display:flex;align-items:flex-start;gap:12px;padding:19px 20px 16px;border-bottom:1px solid #f1f5f9;min-width:0}
        .as-icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:13px;background:linear-gradient(145deg,#d1fae5,#ecfdf5);color:#047857}
        .as-card-heading{min-width:0;flex:1}.as-card-heading h2{font-size:16px;line-height:1.3;font-weight:800;margin:1px 0 5px;color:#0f172a}.as-card-heading p{font-size:12px;line-height:1.55;margin:0;color:#64748b}
        .as-status{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;border-radius:999px;padding:6px 9px;background:#f1f5f9;color:#64748b;font-size:10px;font-weight:800}
        .as-status span{width:6px;height:6px;border-radius:50%;background:#94a3b8}.as-status.is-active{background:#dcfce7;color:#166534}.as-status.is-active span{background:#16a34a}
        .as-card-body{padding:19px 20px;min-width:0}.as-copy{font-size:13px;line-height:1.65;color:#64748b;margin:0 0 14px}.as-field-label{display:block;font-size:12px;font-weight:750;color:#334155;margin:14px 0 7px}
        .as-input{display:block;width:100%;min-width:0;border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:11px 13px;font:inherit;font-size:14px;color:#0f172a;outline:none;transition:border .2s,box-shadow .2s}
        .as-input:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.13)}.as-input:disabled{background:#f8fafc;color:#94a3b8}
        .as-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:10px 14px;border:1px solid transparent;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;text-decoration:none;transition:transform .18s,background .18s,border-color .18s;max-width:100%}
        .as-btn:hover:not(:disabled){transform:translateY(-1px)}.as-btn:active:not(:disabled){transform:scale(.98)}.as-btn:disabled{opacity:.48;cursor:not-allowed}
        .as-btn-primary{background:#047857;color:#fff;box-shadow:0 4px 12px rgba(4,120,87,.15)}.as-btn-primary:hover:not(:disabled){background:#065f46}
        .as-btn-outline{background:#fff;border-color:#dbe4e9;color:#334155}.as-btn-outline:hover:not(:disabled){background:#f8fafc;border-color:#a7f3d0}
        .as-btn-danger{background:#fff;border-color:#fecaca;color:#b91c1c}.as-btn-danger:hover:not(:disabled){background:#fef2f2}
        .as-btn-row{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}.as-secret{padding:13px;border-radius:12px;background:#f8fafc;border:1px dashed #cbd5e1;font:600 12px/1.65 ui-monospace,SFMono-Regular,monospace;overflow-wrap:anywhere;color:#334155}
        .as-codes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.as-code{display:block;padding:10px;border-radius:9px;background:#fff;border:1px solid #e2e8f0;font:700 12px ui-monospace,monospace;text-align:center;overflow-wrap:anywhere}
        .as-passkey-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9}.as-passkey-row:last-child{border-bottom:0}.as-passkey-meta{min-width:0}.as-passkey-meta strong{display:block;font-size:13px;overflow-wrap:anywhere}.as-passkey-meta span{display:block;color:#94a3b8;font-size:11px;margin-top:4px;line-height:1.45}
        .as-method-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 22px}.as-method{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;min-width:0}.as-method-icon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#ecfdf5;color:#047857;flex-shrink:0}.as-method strong{display:block;font-size:11px;font-weight:800;line-height:1.4}.as-method span{display:block;font-size:10px;color:#94a3b8;margin-top:3px}
        .as-section-label{font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.12em;color:#64748b;margin:0 0 12px}
        .as-skeleton{height:12px;border-radius:8px;background:linear-gradient(90deg,#f1f5f9,#e2e8f0,#f1f5f9);background-size:200% 100%;animation:asShimmer 1.3s infinite}
        @keyframes asShimmer{to{background-position:-200% 0}}@media(prefers-reduced-motion:reduce){.as-card,.as-btn{transition:none}.as-skeleton{animation:none}}
        @media(max-width:960px){.as-grid{grid-template-columns:minmax(0,1fr)}.as-method-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:520px){.as-hero{border-radius:20px;padding:22px 18px}.as-card{border-radius:17px}.as-card-head{padding:16px 14px 13px;gap:10px}.as-card-body{padding:15px 14px}.as-icon{width:38px;height:38px}.as-status{font-size:9px;padding:5px 7px}.as-method-strip{gap:8px}.as-method{padding:10px 8px;gap:7px}.as-method-icon{width:30px;height:30px}.as-method strong{font-size:10px}.as-method span{font-size:9px}.as-btn{width:100%}.as-btn-row{gap:8px}.as-passkey-row{align-items:flex-start}.as-codes{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>
      <DashboardLayout title="Security & Recovery" subtitle="Protect your account and keep access to your trips.">
        <main className="as-page">
          <div className="as-hero">
            <div className="as-eyebrow"><FiShield size={15} /> Altuvera account protection</div>
            <h1>Security, made simple.</h1>
            <p>Manage the ways you prove it’s you. Set up a passkey or authenticator, keep backup codes somewhere safe, and know what to do if you lose access.</p>
            <div className="as-hero-bottom">
              <span className="as-trust-pill"><FiLock size={14} /> Email verification stays enabled</span>
              <span className="as-trust-pill"><FiCheckCircle size={14} /> You control your recovery options</span>
              <button type="button" className="as-btn as-btn-outline" onClick={refresh} disabled={loading} style={{background:"rgba(255,255,255,.96)"}}><FiRefreshCw size={14} className={loading ? "as-spin" : ""} /> Refresh status</button>
            </div>
          </div>

          {error && <div className="as-alert as-alert-error" role="alert"><FiAlertCircle size={17} /> <span>{error}</span></div>}
          {message && <div className="as-alert as-alert-success" role="status"><FiCheckCircle size={17} /> <span>{message}</span></div>}

          <div className="as-method-strip" aria-label="Available security methods">
            <div className="as-method"><div className="as-method-icon"><FiMail size={17}/></div><div><strong>Email code</strong><span>Always enabled</span></div></div>
            <div className="as-method"><div className="as-method-icon"><FiKey size={17}/></div><div><strong>Passkeys</strong><span>{passkeys.length} saved</span></div></div>
            <div className="as-method"><div className="as-method-icon"><FiSmartphone size={17}/></div><div><strong>Authenticator</strong><span>{status?.authenticatorEnabled ? "Enabled" : "Optional"}</span></div></div>
            <div className="as-method"><div className="as-method-icon"><FiShield size={17}/></div><div><strong>Recovery codes</strong><span>{status?.recoveryCodesRemaining ?? "—"} remaining</span></div></div>
          </div>

          <p className="as-section-label">Your verification methods</p>
          <div className="as-grid">
            <Card icon={FiKey} title="Passkeys" subtitle="Sign in with your device screen lock, fingerprint, face recognition, or a security key." status={{active:passkeys.length>0,label:passkeys.length ? `${passkeys.length} saved` : "Not set up"}}>
              <p className="as-copy">Passkeys are resistant to phishing. Create one on each device you trust. If this browser or device doesn’t support passkeys, you can use another method below.</p>
              <label className="as-field-label" htmlFor="as-passkey-name">Name this passkey</label>
              <input id="as-passkey-name" className="as-input" value={passkeyName} maxLength={120} onChange={e=>setPasskeyName(e.target.value)} placeholder="e.g. My phone" />
              <div className="as-btn-row"><ActionButton disabled={busy||loading} onClick={addPasskey}><FiKey size={15}/>{busy ? "Please wait…" : "Add a passkey"}</ActionButton></div>
              {loading && passkeys.length===0 ? <div style={{marginTop:16,display:"grid",gap:9}}><div className="as-skeleton" style={{width:"70%"}}/><div className="as-skeleton" style={{width:"45%"}}/></div> : passkeys.length>0 ? <div style={{marginTop:14}}>{passkeys.map(p=><div className="as-passkey-row" key={p.id}><div className="as-passkey-meta"><strong>{p.device_name||"Saved passkey"}</strong><span>Added {p.created_at?new Date(p.created_at).toLocaleDateString():"date unavailable"}{p.last_used_at ? ` · Last used ${new Date(p.last_used_at).toLocaleDateString()}` : ""}</span></div><ActionButton variant="danger" disabled={busy} onClick={()=>{if(!window.confirm("Remove this passkey from your Altuvera account?"))return;run(async()=>{const r=await api("/security/passkeys/"+encodeURIComponent(p.id),null,"DELETE");setMessage(r.message||"Passkey removed.");await refresh();});}}><FiTrash2 size={14}/> Remove</ActionButton></div>)}</div> : <p className="as-copy" style={{marginTop:12,marginBottom:0}}>No passkeys registered yet. Add one above to get started.</p>}
            </Card>

            <Card icon={FiSmartphone} title="Authenticator app" subtitle="Use a time-based code from an authenticator app." status={{active:Boolean(status?.authenticatorEnabled),label:status?.authenticatorEnabled ? "Enabled" : "Not set up"}}>
              <p className="as-copy">Works with Google Authenticator, Microsoft Authenticator, Aegis, and compatible TOTP apps. Altuvera never needs your authenticator account password.</p>
              {!secret ? <ActionButton disabled={busy||loading||Boolean(status?.authenticatorEnabled)} onClick={()=>run(async()=>{const r=await api("/security/totp/setup",{});setSecret(r.data);})}><FiSmartphone size={15}/> Set up authenticator</ActionButton> : <div style={{marginTop:8}}>
                <p className="as-copy">Scan the QR code if your app supports it, or enter this setup key manually.</p>
                {secret.qrCodeDataUrl && <img src={secret.qrCodeDataUrl} alt="Authenticator setup QR code" style={{width:180,maxWidth:"100%",height:"auto",borderRadius:12,border:"1px solid #e2e8f0",padding:8,background:"#fff",marginBottom:12}}/>}
                <div className="as-secret">{secret.secret}</div>
                <div className="as-btn-row"><ActionButton variant="outline" onClick={()=>copyText(secret.secret,"Authenticator setup key copied.")}><FiCopy size={14}/> Copy setup key</ActionButton>{secret.otpauthUrl && <a className="as-btn as-btn-outline" href={secret.otpauthUrl}><FiExternalLink size={14}/> Open app link</a>}</div>
                <label className="as-field-label" htmlFor="as-totp-code">6-digit code from your app</label>
                <input id="as-totp-code" className="as-input" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000"/>
                <div className="as-btn-row"><ActionButton disabled={busy||code.length!==6} onClick={()=>run(async()=>{const r=await api("/security/totp/confirm",{code});setSecret(null);setCode("");setMessage(r.message||"Authenticator enabled.");await refresh();})}><FiCheckCircle size={15}/> Verify and enable</ActionButton><ActionButton variant="outline" onClick={()=>{setSecret(null);setCode("");}}>Cancel</ActionButton></div>
              </div>}
              {status?.authenticatorEnabled && <div style={{marginTop:12}}><label className="as-field-label" htmlFor="as-disable-code">Current authenticator code to disable</label><input id="as-disable-code" className="as-input" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000"/><div className="as-btn-row"><ActionButton variant="danger" disabled={busy||code.length!==6} onClick={()=>run(async()=>{const r=await api("/security/totp/disable",{code});setCode("");setMessage(r.message||"Authenticator disabled.");await refresh();})}><FiShieldOff size={15}/> Disable authenticator</ActionButton></div></div>}
            </Card>

            <Card icon={FiCopy} title="One-time recovery codes" subtitle="Keep backup codes for a moment when your usual method is unavailable." status={{active:Number(status?.recoveryCodesRemaining)>0,label:status?.recoveryCodesRemaining==null ? "Check status" : `${status.recoveryCodesRemaining} remaining`}}>
              <p className="as-copy">Each code can be used once. Generate or replace your set, then save it somewhere private like a password manager. Replacing codes invalidates the old set.</p>
              {status?.authenticatorEnabled && <><label className="as-field-label" htmlFor="as-rotate-code">Authenticator code to replace existing codes</label><input id="as-rotate-code" className="as-input" value={rotateCode} onChange={e=>setRotateCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000"/></>}
              <div className="as-btn-row"><ActionButton disabled={busy||(Boolean(status?.authenticatorEnabled)&&rotateCode.length!==6)} onClick={()=>run(async()=>{const r=await api("/security/recovery-codes",{code:rotateCode});setRecoveryCodes(r.data?.codes||[]);setRotateCode("");setMessage(r.message||"Recovery codes generated. Save them now.");await refresh();})}><FiRefreshCw size={15}/> Generate new codes</ActionButton></div>
              {recoveryCodes.length>0 && <div style={{marginTop:15,border:"1px solid #a7f3d0",background:"#f0fdf4",borderRadius:14,padding:14}}><p style={{fontSize:12,fontWeight:800,color:"#166534",margin:"0 0 10px"}}>Save these now — they will only be shown here once.</p><div className="as-codes">{recoveryCodes.map(c=><code className="as-code" key={c}>{c}</code>)}</div><div className="as-btn-row"><ActionButton onClick={()=>copyText(recoveryCodes.join("\n"),"Recovery codes copied. Store them somewhere safe.")}><FiCopy size={14}/>{copied?"Copied":"Copy all codes"}</ActionButton><ActionButton variant="outline" onClick={()=>{const blob=new Blob([recoveryCodes.join("\n")],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="altuvera-recovery-codes.txt";a.click();URL.revokeObjectURL(url);setMessage("Recovery codes downloaded. Store the file securely.");}}><FiDownload size={14}/> Download</ActionButton></div></div>}
            </Card>

            <Card icon={FiMail} title="Email verification" subtitle="Your account’s baseline sign-in check." status={{active:true,label:"Always enabled"}}>
              <p className="as-copy">Altuvera sends a one-time code to your registered email to confirm sign-in. After that check, any additional security methods enabled for your account can be offered.</p>
              <div className="as-secret" style={{fontFamily:"inherit",fontWeight:650}}>Registered email: verification is sent to the address associated with your signed-in account.</div>
              <div className="as-btn-row"><Link to="/settings" className="as-btn as-btn-outline"><FiMail size={14}/> Email & notification settings <FiArrowRight size={14}/></Link></div>
            </Card>
          </div>

          <p className="as-section-label" style={{marginTop:26}}>Recovery and account safety</p>
          <div className="as-grid">
            <Card icon={FiShield} title="Manual account recovery" subtitle="For situations where you can’t use your registered sign-in methods.">
              <p className="as-copy">Submit a recovery request using your registered email and an alternate email you can access. A request never grants access automatically; the Altuvera team must verify ownership first.</p>
              <form onSubmit={requestRecovery}>
                <label className="as-field-label" htmlFor="as-recovery-email">Registered email address</label>
                <input id="as-recovery-email" className="as-input" type="email" required autoComplete="email" value={recoveryEmail} onChange={e=>{setRecoveryEmail(e.target.value);setRecoveryRequested(false);}} placeholder="you@example.com"/>
                <label className="as-field-label" htmlFor="as-recovery-alt-email">Alternate email you can access</label>
                <input id="as-recovery-alt-email" className="as-input" type="email" required autoComplete="email" value={recoveryContactEmail} onChange={e=>{setRecoveryContactEmail(e.target.value);setRecoveryRequested(false);}} placeholder="trusted-address@example.com"/>
                <p className="as-copy" style={{fontSize:11,marginTop:8,marginBottom:0}}>An administrator must review your request before a recovery link can be issued.</p>
                <div className="as-btn-row"><button className="as-btn as-btn-primary" type="submit" disabled={busy||recoveryRequested}>{recoveryRequested?<><FiCheckCircle size={14}/> Request submitted</>:<><FiShield size={14}/> Request recovery review</>}</button></div>
              </form>
            </Card>

            <Card icon={FiShieldOff} title="Active sessions" subtitle="Use this if you think another person may have access." tone="danger">
              <p className="as-copy">Revoking sessions signs your account out on this device and other devices. You’ll need to sign in again. Only do this if you recognize the security risk.</p>
              <div className="as-btn-row"><ActionButton variant="danger" disabled={busy} onClick={()=>{if(!window.confirm("Revoke all active Altuvera sessions? You will need to sign in again on every device."))return;run(async()=>{const r=await api("/security/revoke-sessions",{});setMessage(r.message||"Active sessions revoked.");});}}><FiShieldOff size={15}/> Revoke all sessions</ActionButton></div>
            </Card>
          </div>

          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12,marginTop:22,padding:"15px 2px",borderTop:"1px solid #e2e8f0"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:7,color:"#64748b",fontSize:12}}><FiClock size={14}/> Keep recovery codes private and review your options periodically.</span>
            <Link to="/dashboard" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#047857",fontWeight:800,fontSize:12,textDecoration:"none"}}>Back to your account <FiArrowRight size={14}/></Link>
          </div>
        </main>
      </DashboardLayout>
    </>
  );
}
