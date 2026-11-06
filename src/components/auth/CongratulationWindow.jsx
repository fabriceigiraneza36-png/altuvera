// src/components/common/CongratulationWindow.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// CONGRATULATION WINDOW v2.0 — Green/White Theme, Lucide Icons, No Emojis
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, CheckCircle, ArrowRight, MapPin, Bookmark,
  Calendar, Star, Sparkles, Globe, Compass, ShieldCheck, Clock, Mail,
} from "lucide-react";
import confetti from "canvas-confetti";
import { API_URL } from "../../utils/apiBase";

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */

const S = {
  backdrop: {
    position:   "fixed",
    inset:      0,
    zIndex:     9998,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
  },
  wrapper: {
    position:       "fixed",
    inset:          0,
    zIndex:         9999,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    padding:        "20px",
    pointerEvents:  "none",
  },
  modal: {
    pointerEvents:  "auto",
    width:          "100%",
    maxWidth:       520,
    maxHeight:      "min(88dvh, 680px)",
    background:     "#ffffff",
    borderRadius:   24,
    display:        "flex",
    flexDirection:  "column",
    overflow:       "hidden",
    boxShadow:      "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
    fontFamily:     "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Top gradient strip */
  topStrip: {
    background:     "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
    padding:        "15px 24px 14px",
    position:       "relative",
    overflow:       "hidden",
    textAlign:      "center",
  },
  stripBubble1: {
    position:     "absolute",
    top:          -60,
    right:        -60,
    width:        180,
    height:       180,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.05)",
    pointerEvents: "none",
  },
  stripBubble2: {
    position:     "absolute",
    bottom:       -40,
    left:         -40,
    width:        140,
    height:       140,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.04)",
    pointerEvents: "none",
  },
  profileRing: {
    width: 48, height: 48, borderRadius: "50%", background: "transparent",
    border: "2px solid rgba(255,255,255,.72)", display: "flex", alignItems: "center",
    justifyContent: "center", margin: 0, overflow: "hidden", position: "relative",
    zIndex: 1, boxShadow: "0 4px 14px rgba(6,78,59,.12)",
  },
  stripTitle: {
    fontSize:    "1.45rem",
    fontWeight:  900,
    color:       "#ffffff",
    margin:      "0 0 6px",
    lineHeight:  1.2,
    position:    "relative",
    zIndex:      1,
  },
  stripSub: {
    fontSize:  "0.85rem",
    color:     "rgba(255,255,255,0.75)",
    margin:    0,
    position:  "relative",
    zIndex:    1,
  },

  /* Close button */
  closeBtn: {
    position:       "absolute",
    top:            14,
    right:          14,
    zIndex:         10,
    width:          34,
    height:         34,
    borderRadius:   "50%",
    border:         "none",
    background:     "rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    cursor:         "pointer",
    color:          "#fff",
    transition:     "background 0.2s",
  },

  /* Body */
  body: { padding: "12px 22px 14px" },

  greeting: {
    textAlign:    "center",
    marginBottom: 14,
  },
  identityChip: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    maxWidth: "100%", margin: "0 auto 10px", padding: "7px 11px",
    borderRadius: 999, background: "#f0fdf4", border: "1px solid #dcfce7",
    color: "#166534", fontSize: "0.76rem", fontWeight: 750,
    overflowWrap: "anywhere",
  },
  loginMeta: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 13px",
    margin: "0 0 14px", borderRadius: 15,
    background: "linear-gradient(115deg,#f0fdf4 0%,#ffffff 72%)",
    border: "1px solid #d9f0e2", boxShadow: "0 5px 18px rgba(6,78,59,.045)",
  },
  loginMetaIcon: {
    width: 39, height: 39, flex: "0 0 39px", borderRadius: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#047857", background: "#dcfce7",
  },
  loginMetaLabel: {
    margin: "0 0 3px", fontSize: "0.7rem", textTransform: "uppercase",
    letterSpacing: ".09em", fontWeight: 850, color: "#527565",
  },
  loginMetaValue: {
    margin: 0, fontSize: "0.84rem", lineHeight: 1.4, fontWeight: 800,
    color: "#123c2d", overflowWrap: "anywhere",
  },
  loginMetaHint: {
    margin: "3px 0 0", fontSize: "0.72rem", lineHeight: 1.35, color: "#64756b",
  },
  greetName: {
    fontSize:   "1.05rem",
    fontWeight: 800,
    color:      "#0f172a",
    margin:     "0 0 4px",
  },
  greetMsg: {
    fontSize:   "0.87rem",
    color:      "#64748b",
    margin:     0,
    lineHeight: 1.55,
  },

  /* Tips */
  tipsWrap: {
    display:        "flex",
    flexDirection:  "column",
    gap:            8,
    marginBottom:   14,
  },
  tipItem: {
    display:     "flex",
    alignItems:  "center",
    gap:         10,
    padding:     "10px 14px",
    background:  "#f8fafc",
    borderRadius: 12,
    border:      "1px solid #e2e8f0",
  },
  tipIconWrap: {
    width:          32,
    height:         32,
    borderRadius:   10,
    background:     "#ecfdf5",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  tipText: {
    fontSize:   "0.85rem",
    fontWeight: 600,
    color:      "#0f172a",
    margin:     0,
  },

  /* CTA button */
  cta: {
    width:          "100%",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
    padding:        "11px 20px",
    borderRadius:   14,
    border:         "none",
    background:     "linear-gradient(135deg, #059669, #047857)",
    color:          "#ffffff",
    fontSize:       "0.95rem",
    fontWeight:     800,
    cursor:         "pointer",
    fontFamily:     "inherit",
    boxShadow:      "0 4px 16px rgba(5,150,105,0.3)",
    transition:     "all 0.2s",
    marginBottom:   16,
  },

  quickLinks: {
    display: "block", position: "relative", width: "100%", marginTop: 10,
    padding: "3px 0 5px", overflow: "hidden",
  },
  quickLink: {
    boxSizing: "border-box", display: "flex", alignItems: "center", gap: 7,
    padding: "8px 10px", borderRadius: 11, flex: "0 0 auto",
    minWidth: 126, maxWidth: 148, minHeight: 40,
  },
};

const KEYFRAMES = `
  @keyframes cgProfileReveal { 0% { transform: translateY(10px) scale(.82); opacity: 0; } 65% { transform: translateY(-3px) scale(1.04); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes cgBubbleDrift { 0%,100% { transform:translate3d(0,0,0) scale(1); } 50% { transform:translate3d(-10px,8px,0) scale(1.06); } }

  .cg-security-panel { width:100%; max-width:100%; margin:0 auto; text-align:center; }
  .cg-security-icon { width:52px;height:52px;margin:0 auto 9px;border-radius:17px;display:grid;place-items:center;color:#047857;background:linear-gradient(145deg,#ecfdf5,#d1fae5);box-shadow:inset 0 0 0 1px #ccebd8,0 7px 18px rgba(5,150,105,.09); }
  .cg-security-title { margin:0 0 5px;color:#102a20;font-size:clamp(1.04rem,3.5vw,1.2rem);line-height:1.25;font-weight:850;letter-spacing:-.02em; }
  .cg-security-copy { margin:0 auto 12px;max-width:390px;color:#64756b;font-size:.81rem;line-height:1.45; }
  .cg-security-methods { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:left;margin:0 0 13px; }
  .cg-security-method { display:flex;align-items:center;gap:8px;min-width:0;padding:9px 8px;border:1px solid #dcefe4;background:linear-gradient(145deg,#fbfefc,#f4fbf6);border-radius:12px; }
  .cg-security-method-icon { width:30px;height:30px;flex:0 0 30px;display:grid;place-items:center;border-radius:9px;background:#e4f7eb;color:#047857; }
  .cg-security-method-title { display:block;color:#153b2d;font-size:.73rem;font-weight:800;line-height:1.2; }
  .cg-security-method-detail { display:block;margin-top:3px;color:#64756b;font-size:.64rem;line-height:1.25; }
  .cg-security-primary { display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:44px;padding:10px 16px;border:0;border-radius:12px;background:linear-gradient(120deg,#059669,#047857);color:#fff;font:800 .86rem inherit;box-shadow:0 7px 18px rgba(5,150,105,.2);cursor:pointer; }
  .cg-security-skip { display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:42px;margin-top:7px;padding:9px 14px;border:1px solid #d7e7dd;border-radius:12px;background:#fff;color:#456153;font:750 .82rem inherit;white-space:nowrap;cursor:pointer; }
  .cg-security-note { margin:8px 0 0;color:#7b8c82;font-size:.67rem;line-height:1.3; }
  @media(max-width:520px) { .cg-security-methods { gap:6px; } .cg-security-method { flex-direction:column;align-items:center;text-align:center;padding:8px 5px;gap:5px; } .cg-security-method-detail { font-size:.61rem; } .cg-security-copy { font-size:.77rem;margin-bottom:9px; } .cg-security-icon { width:46px;height:46px;margin-bottom:7px; } }
  @media(max-width:360px) { .cg-security-method-title { font-size:.68rem; } .cg-security-method-detail { font-size:.57rem; } .cg-security-method-icon { width:27px;height:27px;flex-basis:27px; } }

  .cg-modal { display:flex; flex-direction:column; min-height:0; overflow:hidden; scrollbar-width:none; -ms-overflow-style:none; overscroll-behavior:contain; }
  .cg-modal::-webkit-scrollbar { display:none; width:0; height:0; }
  .cg-user-sticky { position:relative; z-index:30; display:flex; flex:0 0 auto; align-items:center; justify-content:center; width:100%; min-height:62px; box-sizing:border-box; padding:7px 16px; background:#064e3b!important; pointer-events:auto; }
  .cg-user-sticky__identity { display:flex; align-items:center; justify-content:center; min-width:0; flex:0 0 auto; }
  .cg-profile { width:clamp(42px, 11vw, 50px)!important; height:clamp(42px, 11vw, 50px)!important; background:transparent!important; border-color:rgba(5,150,105,.3)!important; box-shadow:0 5px 18px rgba(6,78,59,.10)!important; }
  .cg-modal-scroll { position:relative; flex:1 1 auto; min-height:0; overflow-x:hidden; overflow-y:auto; scrollbar-width:none; -ms-overflow-style:none; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }
  .cg-modal-scroll::-webkit-scrollbar { display:none; width:0; height:0; }
  .cg-modal-scroll::-webkit-scrollbar-thumb { background:transparent; }
  .cg-modal-scroll::-webkit-scrollbar-track { background:transparent; }
  .cg-top { position:relative; z-index:1; isolation:isolate; }
  .cg-top__close { position:absolute; top:12px; right:14px; z-index:5; }
  .cg-body { position:relative; }
  .cg-body { position:relative; }
  .cg-profile { animation:cgProfileReveal .65s cubic-bezier(.2,.8,.2,1) both; }
  .cg-bubble { animation:cgBubbleDrift 7s ease-in-out infinite; }
  .cg-bubble--slow { animation-duration:9s; animation-delay:-2s; }
  .cg-profile-photo { width:100%; height:100%; object-fit:cover; display:block; opacity:.94; }
  @keyframes cgQuickMarquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  .cg-quick-links { position:relative; display:block; width:100%; margin-top:10px; padding:3px 0 5px; overflow:hidden; }
  .cg-marquee-track { display:flex; width:max-content; will-change:transform; animation:cgQuickMarquee 25s linear infinite; }
  .cg-marquee-group { display:flex; flex:0 0 auto; align-items:center; gap:8px; padding-right:8px; }
  .cg-quick-link { box-sizing:border-box; display:flex; align-items:center; gap:7px; min-width:126px; max-width:148px; min-height:40px; padding:8px 10px; border:1px solid #dbece4; border-radius:11px; background:#fbfefc; color:#166534; text-decoration:none; font-size:.74rem; font-weight:750; box-shadow:0 2px 8px rgba(6,78,59,.04); transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease; }
  .cg-quick-icon { display:grid; place-items:center; flex:0 0 25px; width:25px; height:25px; border-radius:8px; background:#ecfdf5; color:#047857; transition:background .18s ease,color .18s ease; }
  .cg-quick-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cg-quick-link:hover { transform:translateY(-2px); background:#ecfdf5; border-color:#86efac; box-shadow:0 6px 14px rgba(5,150,105,.12); }
  .cg-quick-link:hover .cg-quick-icon { background:#047857; color:#fff; }
  .cg-quick-link:focus-visible { transform:translateY(-2px); background:#ecfdf5; border-color:#059669; outline:2px solid #34d399; outline-offset:2px; box-shadow:0 6px 14px rgba(5,150,105,.12); }
  .cg-quick-link:focus-visible .cg-quick-icon { background:#047857; color:#fff; }
  .cg-quick-links:hover .cg-marquee-track,.cg-quick-links:focus-within .cg-marquee-track { animation-play-state:paused; }
  @media (max-width: 520px) { .cg-modal { max-height:min(88dvh,660px)!important; border-radius:20px!important; } .cg-user-sticky { min-height:62px; padding:8px 12px; } .cg-profile { width:clamp(42px, 12vw, 48px)!important;height:clamp(42px, 12vw, 48px)!important; } .cg-top { padding:22px 18px 18px!important; } .cg-top__close { top:10px; right:10px; } .cg-body { padding:10px 16px 12px!important; } .cg-tips { gap:7px!important;margin-bottom:10px!important; } .cg-tip { padding:8px 10px!important; } .cg-cta { margin-bottom:8px!important; } .cg-quick-link { min-width:122px; } }
  @media (prefers-reduced-motion: reduce) { .cg-profile { animation:none!important; } .cg-marquee-track { animation:none!important; transform:none!important; width:auto; } .cg-marquee-group[aria-hidden="true"] { display:none!important; } .cg-quick-links { overflow-x:auto!important; scrollbar-width:none; } .cg-quick-links::-webkit-scrollbar { display:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT CONFIG
═══════════════════════════════════════════════════════════════════════════ */

const CONTENT = {
  signup: {
    Icon:     CheckCircle,
    title:    "Welcome to Altuvera!",
    message:  "Your account is set up. Get ready for an unforgettable safari adventure.",
    subtitle: "Start planning your first trip",
    cta:      "Explore Destinations",
    ctaLink:  "/destinations",
    tips: [
      { icon: Globe,    text: "Browse curated East African destinations" },
      { icon: Compass,  text: "Discover experiences for your next safari" },
      { icon: Star,     text: "Save favorites and plan at your pace" },
    ],
    quickLinks: [
      { icon: Globe, label: "Destinations", href: "/destinations" },
      { icon: Compass, label: "Safari packages", href: "/packages" },
      { icon: Bookmark, label: "My wishlist", href: "/wishlist" },
      { icon: Calendar, label: "My bookings", href: "/my-bookings" },
    ],
  },
  login: {
    Icon:     Sparkles,
    title:    "Welcome Back!",
    message:  "Great to see you again. Ready to plan your next adventure?",
    subtitle: "Pick up where you left off",
    cta:      "View My Bookings",
    ctaLink:  "/my-bookings",
    tips: [
      { icon: Calendar, text: "Check your active bookings" },
      { icon: MapPin,   text: "Return to destinations you love" },
      { icon: Bookmark, text: "Keep your travel plans organized" },
    ],
    quickLinks: [
      { icon: Globe, label: "Destinations", href: "/destinations" },
      { icon: Calendar, label: "My bookings", href: "/my-bookings" },
      { icon: Bookmark, label: "My wishlist", href: "/wishlist" },
      { icon: Star, label: "My profile", href: "/profile" },
    ],
  },
};


const SECURITY_PROMPT_DISMISS_PREFIX = "altuvera_security_prompt_dismissed_v1:";

const getSecurityPromptDismissalKey = (user) => {
  const identity = String(user?.id || user?._id || user?.email || "").trim().toLowerCase();
  return identity ? SECURITY_PROMPT_DISMISS_PREFIX + encodeURIComponent(identity) : "";
};

const readSecurityPromptDismissal = (key) => {
  if (!key) return false;
  try { return localStorage.getItem(key) === "1"; }
  catch {
    try { return sessionStorage.getItem(key) === "1"; }
    catch { return false; }
  }
};

const writeSecurityPromptDismissal = (key) => {
  if (!key) return;
  try { localStorage.setItem(key, "1"); }
  catch { try { sessionStorage.setItem(key, "1"); } catch { /* storage is optional */ } }
};

const clearSecurityPromptDismissal = (key) => {
  if (!key) return;
  try { localStorage.removeItem(key); } catch { /* storage is optional */ }
  try { sessionStorage.removeItem(key); } catch { /* storage is optional */ }
};

const hasConfiguredSecondFactor = (factorPayload, passkeyPayload) => {
  // Match the actual API contract from /users/security/factors:
  // { authenticatorEnabled, passkeys, recoveryCodesRemaining, emailOtpEnabled }.
  // Email OTP alone is the first sign-in step, not an enrolled second factor.
  const factorData = factorPayload?.data?.data
    ?? factorPayload?.data
    ?? factorPayload
    ?? {};

  const enabled = (value) =>
    value === true || value === 1 ||
    (typeof value === "string" && ["true", "1", "enabled", "active", "configured", "verified"].includes(value.trim().toLowerCase()));

  const positiveCount = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    const count = Number(value);
    return Number.isFinite(count) && count > 0;
  };

  if (
    enabled(factorData.authenticatorEnabled ?? factorData.authenticator_enabled ?? factorData.totpEnabled ?? factorData.totp_enabled) ||
    enabled(factorData.passkeyEnabled ?? factorData.passkey_enabled) ||
    positiveCount(factorData.passkeys ?? factorData.passkeyCount ?? factorData.passkey_count) ||
    positiveCount(factorData.recoveryCodesRemaining ?? factorData.recovery_codes_remaining)
  ) return true;

  // The passkey list is a second source of truth. Ignore explicitly revoked
  // or disabled credentials; only registered, usable credentials count.
  const passkeyData = passkeyPayload?.data?.data
    ?? passkeyPayload?.data
    ?? passkeyPayload;
  const passkeys = Array.isArray(passkeyData)
    ? passkeyData
    : Array.isArray(passkeyData?.passkeys)
      ? passkeyData.passkeys
      : Array.isArray(passkeyData?.items)
        ? passkeyData.items
        : [];

  return passkeys.some((passkey) => {
    if (!passkey || typeof passkey !== "object") return Boolean(passkey);
    if (passkey.revoked === true || passkey.isActive === false || passkey.is_active === false || passkey.enabled === false) return false;
    const status = String(passkey.status || "").toLowerCase();
    return !status || ["active", "enabled", "registered", "verified"].includes(status);
  });
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function CongratulationWindow({ isVisible, type, user, onClose }) {
  const confettiFiredRef = useRef(false);
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);

  const securityPromptKey = getSecurityPromptDismissalKey(user);

  useEffect(() => {
    let cancelled = false;
    if (!isVisible) {
      setShowSecurityPrompt(false);
      return undefined;
    }

    setShowSecurityPrompt(false);
    if (type !== "signup" && type !== "login") return undefined;

    const checkFactors = async () => {
      try {
        let token = "";
        try {
          token = localStorage.getItem("altuvera_auth_token") || sessionStorage.getItem("altuvera_auth_token") || "";
        } catch { /* storage may be restricted */ }
        if (!token) return;

        const headers = { Authorization: "Bearer " + token };
        const factorResponse = await fetch(API_URL + "/users/security/factors", { headers });
        const passkeyResponse = await fetch(API_URL + "/users/security/passkeys", { headers });

        if (!factorResponse.ok) return;
        const factorsPayload = await factorResponse.json();
        if (factorsPayload?.success === false) return;

        let passkeysPayload = null;
        if (passkeyResponse.ok) {
          passkeysPayload = await passkeyResponse.json();
          if (passkeysPayload?.success === false) passkeysPayload = null;
        }

        const hasConfiguredFactor = hasConfiguredSecondFactor(factorsPayload, passkeysPayload);
        if (cancelled) return;

        if (hasConfiguredFactor) {
          clearSecurityPromptDismissal(securityPromptKey);
          setShowSecurityPrompt(false);
          return;
        }

        // A failed status request is not evidence that the user has no factor.
        if (!passkeyResponse.ok || !passkeysPayload) return;
        setShowSecurityPrompt(!readSecurityPromptDismissal(securityPromptKey));
      } catch {
        // Unknown status is not proof that setup is missing; fail closed.
        if (!cancelled) setShowSecurityPrompt(false);
      }
    };

    checkFactors();
    return () => { cancelled = true; };
  }, [isVisible, type, securityPromptKey]);

  useEffect(() => {
    if (!isVisible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isVisible]);

  const cfg       = CONTENT[type] || CONTENT.login;
  const displayName = (user?.fullName || user?.name || "").trim();
  const firstName = displayName.split(/\s+/)[0] || null;
  const avatarUrl = user?.avatar || user?.profilePicture || user?.profileImage || user?.avatarUrl || user?.picture || "";
  const avatarInitials = (displayName || user?.email || "A").trim().split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const lastLoginRaw = user?.lastLogin || user?.last_login || user?.lastLoginAt || user?.last_login_at || null;
  const lastLoginDate = lastLoginRaw ? new Date(lastLoginRaw) : null;
  const hasLastLogin = Boolean(lastLoginDate && Number.isFinite(lastLoginDate.getTime()));
  const sessionDate = new Date();
  const timestampDate = hasLastLogin ? lastLoginDate : sessionDate;
  const formattedLoginTime = timestampDate.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
  const formattedLoginFullDate = timestampDate.toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
  const formattedLoginClock = timestampDate.toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  /* ── Confetti ── */
  useEffect(() => {
    if (!isVisible) {
      confettiFiredRef.current = false;
      return undefined;
    }
    if (confettiFiredRef.current) return undefined;
    confettiFiredRef.current = true;

    const fire = () => {
      confetti({
        particleCount: 100,
        spread: 78,
        origin: { y: 0.58 },
        gravity: 0.78,
        shapes: ["circle", "square"],
        colors: ["#059669", "#10b981", "#34d399", "#a7f3d0", "#d1fae5", "#fbbf24"],
      });
      setTimeout(() => {
        confetti({ particleCount: 40, spread: 100, origin: { x: 0.18, y: 0.35 } });
        confetti({ particleCount: 40, spread: 100, origin: { x: 0.82, y: 0.35 } });
      }, 220);
    };

    const timer = setTimeout(fire, 160);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const rememberSecurityPromptDismissal = () => writeSecurityPromptDismissal(securityPromptKey);

  const handleClose = () => {
    // Remember that the user chose to defer security setup for this account.
    if (showSecurityPrompt) {
      rememberSecurityPromptDismissal();
      setShowSecurityPrompt(false);
      return;
    }
    confettiFiredRef.current = false;
    onClose?.();
  };

  const handleCta = () => {
    handleClose();
    if (cfg.ctaLink) window.location.href = cfg.ctaLink;
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              style={S.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
            />

            {/* Wrapper */}
            <div style={S.wrapper}>
              <motion.div
                className="cg-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cg-welcome-title"
                style={S.modal}
                initial={{ opacity: 0, scale: 0.88, y: 22 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                {/* This avatar rail stays centered and stationary while the welcome content scrolls. */}
                <div className="cg-user-sticky" aria-label="Signed-in profile">
                  <motion.div
                    className="cg-user-sticky__identity"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="cg-profile"
                      style={S.profileRing}
                      initial={{ scale: 0.82, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.08 }}
                    >
                      {avatarUrl
                        ? <img className="cg-profile-photo" src={avatarUrl} alt={`${displayName || "Your"} profile`} />
                        : <span aria-label="Profile initials" style={{ color:"#075538", fontWeight:900, fontSize:15 }}>{avatarInitials}</span>}
                    </motion.div>
                  </motion.div>
                </div>

                {/* All welcome text, actions and security options live in this scroll area. */}
                <div className="cg-modal-scroll">
                  {/* ── Top strip ─────────────────────────────────────── */}
                  <div className="cg-top" style={S.topStrip}>
                    <div className="cg-bubble" style={S.stripBubble1} />
                    <div className="cg-bubble cg-bubble--slow" style={S.stripBubble2} />
                    <button
                      type="button"
                      className="cg-user-sticky__close cg-top__close"
                      style={S.closeBtn}
                      onClick={handleClose}
                      aria-label="Close welcome window"
                    >
                      <X size={17} />
                    </button>

                  <motion.h2
                    id="cg-welcome-title"
                    style={S.stripTitle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                  >
                    {cfg.title}
                  </motion.h2>

                  <motion.p
                    style={S.stripSub}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {cfg.message}
                  </motion.p>
                </div>

                {/* ── Body ──────────────────────────────────────────── */}
                <div className="cg-body" style={S.body}>

                  {(type === "signup" || type === "login") && showSecurityPrompt ? (
                    <div className="cg-security-panel">
                      <div className="cg-security-icon"><ShieldCheck size={26} strokeWidth={2.1} /></div>
                      <h3 className="cg-security-title">Add another way to sign in?</h3>
                      <p className="cg-security-copy">Your account is ready. Add a backup sign-in method for extra protection. This is optional, and you can continue without setting anything up.</p>
                      <div className="cg-security-methods">
                        {[
                          { Icon: ShieldCheck, title: "Authenticator app", detail: "Free 6-digit codes" },
                          { Icon: CheckCircle, title: "Passkey", detail: "PIN, face or fingerprint" },
                          { Icon: Clock, title: "Recovery codes", detail: "Backup access" },
                        ].map(({ Icon: MethodIcon, title, detail }) => (
                          <div key={title} className="cg-security-method">
                            <span className="cg-security-method-icon"><MethodIcon size={16} /></span>
                            <span style={{ minWidth: 0 }}>
                              <strong className="cg-security-method-title">{title}</strong>
                              <span className="cg-security-method-detail">{detail}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="cg-security-primary" onClick={() => { rememberSecurityPromptDismissal(); setShowSecurityPrompt(false); onClose?.(); window.location.assign("/account/security"); }}>
                        <span>Set up account security</span><ArrowRight size={17} aria-hidden="true" />
                      </button>
                      <button type="button" className="cg-security-skip" onClick={() => { rememberSecurityPromptDismissal(); setShowSecurityPrompt(false); }}>
                        <span>Skip for now and continue</span><ArrowRight size={15} aria-hidden="true" />
                      </button>
                      <p className="cg-security-note">You can add or change these methods anytime in Account Security.</p>
                    </div>
                  ) : (
                    <>
                  {/* Personalised greeting */}
                  {firstName && (
                    <motion.div
                      style={S.greeting}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0  }}
                      transition={{ delay: 0.4 }}
                    >
                      <p style={S.greetName}>
                        {type === "signup"
                          ? `Welcome, ${firstName}!`
                          : `Hello again, ${firstName}!`}
                      </p>
                      {user?.email && (
                        <div style={S.identityChip}>
                          <Mail size={13} aria-hidden="true" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      <p style={S.greetMsg}>{cfg.subtitle}</p>
                    </motion.div>
                  )}

                  {type !== "signup" && (
                    <motion.section
                      aria-label="Last login details"
                      style={S.loginMeta}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.43, duration: 0.32 }}
                    >
                      <div style={S.loginMetaIcon}><Clock size={19} aria-hidden="true" /></div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={S.loginMetaLabel}>{hasLastLogin ? "Last login" : "Signed in this session"}</p>
                        <p style={S.loginMetaValue} title={`${formattedLoginFullDate} · ${formattedLoginClock}`}>
                          {formattedLoginTime}
                        </p>
                        <p style={S.loginMetaHint}>
                          {hasLastLogin ? "Time shown in your device’s local time zone" : `Session started ${formattedLoginClock} · last-login history wasn’t provided by the server`}
                        </p>
                      </div>
                      <CheckCircle size={17} color="#059669" aria-hidden="true" style={{ flex: "0 0 auto" }} />
                    </motion.section>
                  )}

                  {/* Tips */}
                  <div className="cg-tips" style={S.tipsWrap}>
                    {cfg.tips.map(({ icon: TipIcon, text }, idx) => (
                      <motion.div
                        key={text}
                        className="cg-tip"
                        style={S.tipItem}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0   }}
                        transition={{ delay: 0.45 + idx * 0.1 }}
                      >
                        <div style={S.tipIconWrap}>
                          <TipIcon size={16} color="#059669" />
                        </div>
                        <p style={S.tipText}>{text}</p>
                      </motion.div>
                    ))}
                  </div>

                  {type === "signup" && (
                    <p style={{ margin: "0 0 12px", textAlign: "center", color: "#047857", fontSize: "0.78rem", lineHeight: 1.5 }}>
                      A welcome email is on its way to your inbox.
                    </p>
                  )}



                  {/* CTA */}
                  <motion.button
                    className="cg-cta"
                    style={S.cta}
                    onClick={handleCta}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: 0.75 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 6px 22px rgba(5,150,105,0.38)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cfg.cta}
                    <ArrowRight size={18} />
                  </motion.button>

                  <nav aria-label="Quick actions" className="cg-quick-links" style={S.quickLinks}>
                    <div className="cg-marquee-track">
                      {[false, true].map((isDuplicate) => (
                        <div
                          key={isDuplicate ? "duplicate" : "primary"}
                          className="cg-marquee-group"
                          aria-hidden={isDuplicate ? "true" : undefined}
                        >
                          {(cfg.quickLinks || []).map(({ icon: LinkIcon, label, href }) => (
                            <a
                              key={href}
                              href={href}
                              className="cg-quick-link"
                              style={S.quickLink}
                              tabIndex={isDuplicate ? -1 : undefined}
                              aria-label={label}
                              onClick={() => handleClose()}
                            >
                              <span className="cg-quick-icon"><LinkIcon size={15} aria-hidden="true" /></span>
                              <span className="cg-quick-label">{label}</span>
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </nav>

                    </>)}
                </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}