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
    maxWidth:       460,
    maxHeight:      "min(88dvh, 760px)",
    background:     "#ffffff",
    borderRadius:   24,
    overflowX:      "hidden",
    overflowY:      "auto",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    boxShadow:      "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
    fontFamily:     "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Top gradient strip */
  topStrip: {
    background:     "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
    padding:        "22px 24px 20px",
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
    width: 46, height: 46, borderRadius: "50%", background: "#eaf6ee",
    border: "2px solid #cce7d6", display: "flex", alignItems: "center",
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
  body: { padding: "16px 22px 20px" },

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
  .cg-modal { scrollbar-width:none; -ms-overflow-style:none; overscroll-behavior:contain; }
  .cg-modal::-webkit-scrollbar { display:none; width:0; height:0; }
  .cg-user-sticky { position:sticky; top:0; z-index:30; display:flex; align-items:center; gap:10px; width:100%; box-sizing:border-box; padding:10px 17px 9px; background:transparent; pointer-events:auto; }
  .cg-user-sticky__identity { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
  .cg-user-sticky__copy { display:flex; flex-direction:column; min-width:0; gap:2px; }
  .cg-user-sticky__copy strong { max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#10452f; font-size:.83rem; font-weight:850; line-height:1.2; }
  .cg-user-sticky__copy small { max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#648071; font-size:.69rem; line-height:1.2; }
  .cg-user-sticky__close { display:grid; place-items:center; flex:0 0 36px; width:36px; height:36px; padding:0; border:1px solid rgba(6,78,59,.16); border-radius:50%; color:#155b3e; background:transparent; cursor:pointer; transition:background .18s ease,border-color .18s ease,transform .18s ease; }
  .cg-user-sticky__close:hover { background:rgba(5,150,105,.08); border-color:rgba(5,150,105,.34); transform:rotate(5deg); }
  .cg-user-sticky__close:focus-visible { outline:3px solid rgba(5,150,105,.24); outline-offset:2px; }
  .cg-top { position:relative; z-index:1; isolation:isolate; }
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
  @media (max-width: 520px) { .cg-modal { max-height:min(90dvh,720px)!important; border-radius:20px!important; } .cg-user-sticky { padding:9px 13px 8px; gap:8px; } .cg-user-sticky__copy strong { max-width:min(58vw,220px); font-size:.78rem; } .cg-user-sticky__copy small { max-width:min(58vw,220px); font-size:.65rem; } .cg-user-sticky__close { flex-basis:34px; width:34px; height:34px; } .cg-top { padding:22px 18px 18px!important; } .cg-body { padding:14px 16px 16px!important; } .cg-profile { width:42px!important;height:42px!important; } .cg-tips { gap:7px!important;margin-bottom:10px!important; } .cg-tip { padding:8px 10px!important; } .cg-cta { margin-bottom:8px!important; } .cg-quick-link { min-width:122px; } }
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
      { icon: Globe,    text: "Browse curated African destinations" },
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

const isEnabledSecurityFlag = (value) => {
  if (value === true || value === 1) return true;
  return typeof value === "string" && ["true", "1", "enabled", "active", "configured", "verified"].includes(value.trim().toLowerCase());
};

const collectSecurityObjects = (value, output = [], seen = new Set(), depth = 0) => {
  if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) return output;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item) => collectSecurityObjects(item, output, seen, depth + 1));
    return output;
  }
  output.push(value);
  [
    "data", "factors", "security", "authenticator", "totp", "passkey",
    "webauthn", "mfa", "twoFactor", "two_factor", "enabledFactors",
    "enabled_factors", "registeredFactors", "registered_factors",
  ].forEach((key) => collectSecurityObjects(value[key], output, seen, depth + 1));
  return output;
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
                {/* ── Top strip ─────────────────────────────────────── */}
                <div className="cg-top" style={S.topStrip}>
                  <div className="cg-bubble" style={S.stripBubble1} />
                  <div className="cg-bubble cg-bubble--slow" style={S.stripBubble2} />

                {/* A transparent, sticky identity row stays visible while the modal content scrolls. */}
                <div className="cg-user-sticky">
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
                    <span className="cg-user-sticky__copy">
                      <strong>{displayName || "Altuvera traveler"}</strong>
                      <small>{user?.email || "Signed in to your Altuvera account"}</small>
                    </span>
                  </motion.div>
                  <button
                    type="button"
                    className="cg-user-sticky__close"
                    onClick={handleClose}
                    aria-label="Close welcome window"
                  >
                    <X size={17} />
                  </button>
                </div>

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
                    <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
                      <div style={{ width: 62, height: 62, margin: "0 auto 16px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#047857", background: "#ecfdf5" }}>
                        <ShieldCheck size={30} />
                      </div>
                      <h3 style={{ margin: "0 0 8px", color: "#102a20", fontSize: "clamp(1.08rem, 4vw, 1.2rem)", lineHeight: 1.3, fontWeight: 850 }}>Add another way to sign in?</h3>
                      <p style={{ margin: "0 auto 16px", maxWidth: 340, color: "#64756b", fontSize: "0.88rem", lineHeight: 1.6 }}>Your account is ready. Add a backup sign-in method for extra protection. This is optional, and you can continue without setting anything up.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 9, textAlign: "left", margin: "0 0 18px" }}>
                        {[
                          { Icon: ShieldCheck, title: "Authenticator app", detail: "Free 6-digit codes" },
                          { Icon: CheckCircle, title: "Passkey", detail: "Device PIN, face or fingerprint" },
                          { Icon: Clock, title: "Recovery codes", detail: "A backup if you lose access" },
                        ].map(({ Icon: MethodIcon, title, detail }) => (
                          <div key={title} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, padding: "11px 10px", border: "1px solid #dcefe4", background: "#fbfefc", borderRadius: 13 }}>
                            <span style={{ width: 34, height: 34, flex: "0 0 34px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#ecfdf5", color: "#047857" }}><MethodIcon size={17} /></span>
                            <span style={{ minWidth: 0 }}><strong style={{ display: "block", color: "#153b2d", fontSize: "0.79rem" }}>{title}</strong><span style={{ display: "block", color: "#64756b", fontSize: "0.7rem", lineHeight: 1.4 }}>{detail}</span></span>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => { rememberSecurityPromptDismissal(); setShowSecurityPrompt(false); onClose?.(); window.location.assign("/account/security"); }} style={{ ...S.cta, marginBottom: 10 }}>
                        Set up account security <ArrowRight size={18} />
                      </button>
                      <button type="button" onClick={() => { rememberSecurityPromptDismissal(); setShowSecurityPrompt(false); }} style={{ width: "100%", minHeight: 46, border: "1px solid #dbe8e0", borderRadius: 13, background: "#fff", color: "#456153", fontSize: "0.88rem", fontWeight: 750, cursor: "pointer", transition: "background .2s, border-color .2s" }}>
                        Skip for now and continue <ArrowRight size={15} style={{ marginLeft: 5, verticalAlign: "middle" }} />
                      </button>
                      <p style={{ margin: "10px 0 0", color: "#7b8c82", fontSize: "0.72rem", lineHeight: 1.4 }}>You can add or change these methods anytime in Account Security.</p>
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
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}