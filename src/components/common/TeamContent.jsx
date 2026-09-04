// src/components/common/TeamContent.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// TEAM CONTENT v4.1 — Backend-Only, Premium Dark Green & White Cards
// ═══════════════════════════════════════════════════════════════════════════════
// • Fully backend-driven (no fallback data)
// • Robust API_BASE resolution (handles VITE_API_URL with or without /api)
// • Handles multiple backend response shapes ({data}, {success,data}, [])
// • Maps backend field names (avatar_url → image_url, etc.)
// • Professional, elegant card design with hover interactions
// • Optimized responsive grid (1/2/3 columns)
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import {
  FiArrowRight, FiLinkedin, FiMail, FiTwitter, FiInstagram,
  FiExternalLink, FiMapPin, FiAward, FiUsers, FiGlobe,
  FiPhone, FiCalendar, FiRefreshCw, FiChevronDown,
  FiWifiOff, FiStar, FiFacebook,
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";

/* ═══════════════════════════════════════════════════════════════════════════
   API LAYER — robust base URL resolution
═══════════════════════════════════════════════════════════════════════════ */

// Resolves the correct API base:
//   VITE_API_URL="https://backend-jd8f.onrender.com"        -> ".../api"
//   VITE_API_URL="https://backend-jd8f.onrender.com/api"    -> ".../api"
//   VITE_API_URL="https://backend-jd8f.onrender.com/api/"   -> ".../api"
//   unset                                                    -> "https://backend-jd8f.onrender.com/api"
const resolveApiBase = () => {
  const raw = (import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com").trim();
  const trimmed = raw.replace(/\/+$/, ""); // remove trailing slashes
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const API_BASE = resolveApiBase();

const teamAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { Accept: "application/json", ...options.headers },
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(
          e.message || e.error || `Request failed with status ${res.status}`
        );
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (
        retries > 0 &&
        err.name !== "AbortError" &&
        !/status \d+/.test(err.message)
      ) {
        await new Promise((r) => setTimeout(r, 800));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },
  getAll(params = {}) {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      )
    ).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
  getDepartments() {
    return this._fetch("/team/departments/list");
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   NORMALIZERS — reconcile backend fields with what the UI expects
═══════════════════════════════════════════════════════════════════════════ */

const asArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [p];
    } catch {
      return v.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const normalizeMember = (m = {}) => ({
  id:            m.id,
  name:          m.name || "",
  role:          m.role || "",
  department:    m.department || "",
  bio:           m.bio || "",
  // The backend may return image_url, avatar_url, imageUrl or image
  image_url:     m.image_url || m.imageUrl || m.avatar_url || m.photo_url || m.profile_image_url || m.image || null,
  email:         m.email || "",
  phone:         m.phone || "",
  linkedin_url:  m.linkedin_url || "",
  twitter_url:   m.twitter_url || "",
  instagram_url: m.instagram_url || "",
  facebook_url:  m.facebook_url || "",
  website_url:   m.website_url || "",
  expertise:     asArray(m.expertise),
  languages:     asArray(m.languages),
  certifications:asArray(m.certifications),
  years_experience: parseInt(m.years_experience) || 0,
  location:      m.location || "",
  country:       m.country || "",
  display_order: parseInt(m.display_order) || 0,
  is_active:     m.is_active !== false,
  is_featured:   m.is_featured === true,
});

// Handle every possible backend response shape
const extractList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.members)) return payload.members;
  return [];
};

// Departments come back as either strings or { name, memberCount } objects
const normalizeDepartments = (payload) => {
  const list = extractList(payload);
  return list
    .map((d) => {
      if (typeof d === "string") return d;
      if (d && typeof d === "object") return d.name || d.department || "";
      return "";
    })
    .filter((n) => n && n.toLowerCase() !== "all");
};

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════════════ */

const C = {
  ink:         "#022c22",
  darkGreen:   "#064e3b",
  green:       "#065f46",
  medGreen:    "#047857",
  lightGreen:  "#059669",
  brightGreen: "#10b981",
  paleGreen:   "#a7f3d0",
  softGreen:   "#d1fae5",
  faintGreen:  "#ecfdf5",
  ghostGreen:  "#f0fdf4",
  white:       "#ffffff",
  offWhite:    "#fafffe",
  border:      "#d1fae5",
  borderLight: "#e6f5ee",
  divider:     "#e5e7eb",
  textDark:    "#022c22",
  textMed:     "#065f46",
  textLight:   "#047857",
  textMuted:   "#6b7280",
  textFaint:   "#9ca3af",
  amber:       "#f59e0b",
  amberSoft:   "#fef3c7",
  red:         "#dc2626",
  redSoft:     "#fef2f2",
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

.tm-root{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
  -webkit-font-smoothing:antialiased;
  padding:clamp(48px,6vw,88px) clamp(16px,4vw,48px);
  background:
    radial-gradient(ellipse at top,${C.ghostGreen} 0%,transparent 55%),
    radial-gradient(ellipse at bottom right,${C.faintGreen} 0%,transparent 45%),
    ${C.white};
  position:relative;
  overflow:hidden;
}
.tm-root::before{
  content:'';position:absolute;inset:0;
  background-image:
    radial-gradient(circle at 20% 20%,${C.softGreen}22 1px,transparent 1px),
    radial-gradient(circle at 80% 80%,${C.paleGreen}22 1px,transparent 1px);
  background-size:60px 60px,80px 80px;
  pointer-events:none;opacity:.4;
}
.tm-wrap{max-width:1200px;margin:0 auto;position:relative;z-index:1}

.tm-head{text-align:center;margin-bottom:32px}
.tm-eyebrow{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 14px;border-radius:999px;
  background:${C.faintGreen};border:1px solid ${C.softGreen};
  color:${C.medGreen};font-size:11px;font-weight:700;
  text-transform:uppercase;letter-spacing:.12em;margin-bottom:14px;
}
.tm-h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(28px,4.5vw,44px);font-weight:800;
  color:${C.ink};margin:0 0 12px;line-height:1.15;letter-spacing:-.025em;
}
.tm-h2 em{
  font-style:normal;
  background:linear-gradient(135deg,${C.lightGreen} 0%,${C.medGreen} 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  position:relative;
}
.tm-h2 em::after{
  content:'';position:absolute;left:0;right:0;bottom:-3px;height:3px;
  background:linear-gradient(90deg,${C.brightGreen},${C.lightGreen});
  border-radius:2px;opacity:.35;
}
.tm-sub{
  font-size:clamp(14px,1.7vw,16px);color:${C.textMuted};
  line-height:1.75;max-width:600px;margin:0 auto;font-weight:400;
}

.tm-filters{
  display:flex;flex-wrap:wrap;justify-content:center;
  gap:8px;margin-bottom:36px;
}
.tm-fbtn{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 16px;border-radius:10px;
  border:1.5px solid ${C.softGreen};background:${C.white};
  color:${C.green};font-family:'Inter',sans-serif;
  font-size:13px;font-weight:600;
  cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1);
  white-space:nowrap;
}
.tm-fbtn:hover{
  background:${C.faintGreen};border-color:${C.paleGreen};
  transform:translateY(-1px);
}
.tm-fbtn.on{
  background:linear-gradient(135deg,${C.darkGreen} 0%,${C.green} 100%);
  border-color:${C.darkGreen};color:${C.white};
  box-shadow:0 4px 12px rgba(6,78,59,.28);
}
.tm-fcount{
  min-width:20px;height:18px;padding:0 6px;border-radius:5px;
  background:rgba(6,78,59,.1);font-size:10px;font-weight:800;
  display:inline-flex;align-items:center;justify-content:center;color:inherit;
}
.tm-fbtn.on .tm-fcount{background:rgba(255,255,255,.22);color:${C.white}}
.tm-fmore{
  display:inline-flex;align-items:center;gap:5px;
  padding:8px 14px;border-radius:10px;
  border:1.5px dashed ${C.paleGreen};
  background:transparent;color:${C.lightGreen};
  font-family:'Inter',sans-serif;font-size:12.5px;font-weight:600;
  cursor:pointer;transition:all .2s;
}
.tm-fmore:hover{background:${C.faintGreen};border-style:solid}

.tm-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:24px;margin-bottom:44px;
}

.tm-card{
  background:${C.white};border-radius:20px;
  border:1px solid ${C.borderLight};overflow:hidden;
  display:flex;flex-direction:column;
  transition:all .35s cubic-bezier(.4,0,.2,1);
  position:relative;isolation:isolate;
}
.tm-card::before{
  content:'';position:absolute;inset:0;z-index:-1;
  background:linear-gradient(135deg,${C.faintGreen} 0%,${C.white} 60%);
  opacity:0;transition:opacity .4s;
}
.tm-card:hover{
  transform:translateY(-6px);border-color:${C.paleGreen};
  box-shadow:0 20px 45px -12px rgba(6,78,59,.15),0 8px 20px -8px rgba(6,78,59,.08);
}
.tm-card:hover::before{opacity:1}

.tm-card-band{
  height:78px;
  background:linear-gradient(135deg,${C.darkGreen} 0%,${C.green} 55%,${C.medGreen} 100%);
  position:relative;overflow:hidden;
}
.tm-card-band::before{
  content:'';position:absolute;inset:0;
  background-image:
    radial-gradient(circle at 15% 30%,rgba(255,255,255,.12) 0%,transparent 40%),
    radial-gradient(circle at 85% 70%,rgba(255,255,255,.08) 0%,transparent 40%);
}
.tm-card-band::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,${C.paleGreen}66,transparent);
}

.tm-feat{
  position:absolute;top:12px;right:12px;z-index:2;
  display:inline-flex;align-items:center;gap:4px;
  padding:5px 10px;border-radius:6px;
  background:rgba(255,255,255,.95);backdrop-filter:blur(8px);
  color:${C.amber};font-size:10px;font-weight:800;
  text-transform:uppercase;letter-spacing:.06em;
  box-shadow:0 2px 8px rgba(0,0,0,.15);
}

.tm-card-body{
  padding:0 22px 22px;display:flex;flex-direction:column;
  align-items:center;text-align:center;
  flex:1;margin-top:-46px;position:relative;
}

.tm-avatar{
  width:96px;height:96px;border-radius:50%;position:relative;
  margin-bottom:16px;flex-shrink:0;
}
.tm-avatar-ring{
  width:100%;height:100%;border-radius:50%;overflow:hidden;
  border:4px solid ${C.white};background:${C.faintGreen};
  box-shadow:0 4px 12px rgba(6,78,59,.15),0 0 0 1px ${C.softGreen};
  transition:all .3s;position:relative;
}
.tm-card:hover .tm-avatar-ring{
  box-shadow:0 8px 20px rgba(6,78,59,.25),0 0 0 1px ${C.paleGreen};
}
.tm-avatar-img{
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s ease,opacity .35s ease;
}
.tm-card:hover .tm-avatar-img{transform:scale(1.08)}
.tm-avatar-fb{
  width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,${C.faintGreen} 0%,${C.softGreen} 100%);
}
.tm-avatar-in{
  font-family:'Playfair Display',serif;
  font-size:32px;font-weight:800;color:${C.lightGreen};
}
.tm-dot{
  position:absolute;bottom:4px;right:4px;
  width:14px;height:14px;border-radius:50%;
  border:3px solid ${C.white};box-shadow:0 1px 4px rgba(0,0,0,.15);
}

.tm-name{
  font-family:'Playfair Display',serif;
  font-size:18px;font-weight:700;color:${C.ink};
  margin:0 0 4px;line-height:1.25;letter-spacing:-.01em;
}
.tm-role{
  font-size:13.5px;color:${C.lightGreen};
  font-weight:600;margin:0 0 10px;letter-spacing:.005em;
}
.tm-dept{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 11px;border-radius:6px;
  background:${C.faintGreen};border:1px solid ${C.softGreen};
  font-size:10.5px;color:${C.medGreen};font-weight:700;
  text-transform:uppercase;letter-spacing:.04em;margin-bottom:14px;
}
.tm-dept::before{
  content:'';width:5px;height:5px;border-radius:50%;background:${C.lightGreen};
}

.tm-divider{
  width:36px;height:2px;border-radius:2px;
  background:linear-gradient(90deg,${C.paleGreen},${C.lightGreen},${C.paleGreen});
  margin:0 auto 14px;
}

.tm-bio{
  font-size:13px;color:${C.textMuted};
  line-height:1.65;margin:0 0 14px;
  display:-webkit-box;-webkit-line-clamp:3;
  -webkit-box-orient:vertical;overflow:hidden;
  min-height:63px;
}

.tm-tags{
  display:flex;flex-wrap:wrap;justify-content:center;
  gap:5px;margin-bottom:14px;
}
.tm-tag{
  padding:3px 9px;border-radius:6px;
  background:${C.white};border:1px solid ${C.softGreen};
  font-size:10.5px;color:${C.green};font-weight:600;
  transition:all .2s;
}
.tm-tag:hover{background:${C.faintGreen};border-color:${C.paleGreen}}
.tm-tag-x{
  padding:3px 8px;border-radius:6px;
  background:${C.darkGreen};color:${C.white};
  font-size:10px;font-weight:800;
}

.tm-meta{
  display:flex;flex-direction:column;
  gap:6px;margin-bottom:16px;width:100%;
}
.tm-mi{
  display:flex;align-items:center;justify-content:center;
  gap:7px;font-size:11.5px;color:${C.textMuted};font-weight:500;
}
.tm-mi svg{flex-shrink:0;color:${C.lightGreen}}
.tm-mi.tm-mi-award svg{color:${C.amber}}
.tm-mi.tm-mi-award{color:#b45309}

.tm-socials{
  display:flex;justify-content:center;gap:7px;
  padding-top:16px;border-top:1px solid ${C.borderLight};
  margin-top:auto;width:100%;
}
.tm-slink{
  width:34px;height:34px;border-radius:9px;
  border:1px solid ${C.borderLight};background:${C.white};
  color:${C.green};display:flex;align-items:center;justify-content:center;
  text-decoration:none;
  transition:all .22s cubic-bezier(.4,0,.2,1);position:relative;
}
.tm-slink:hover{
  background:linear-gradient(135deg,${C.darkGreen},${C.green});
  border-color:${C.darkGreen};color:${C.white};
  transform:translateY(-2px);
  box-shadow:0 4px 12px rgba(6,78,59,.28);
}

.tm-sk{
  background:linear-gradient(110deg,
    ${C.borderLight} 8%,${C.faintGreen} 18%,${C.borderLight} 33%);
  background-size:200% 100%;
  animation:tmShim 1.5s ease-in-out infinite;
  border-radius:6px;
}
@keyframes tmShim{
  from{background-position:-200% 0}
  to{background-position:200% 0}
}
.tm-sk-card{
  background:${C.white};border-radius:20px;
  border:1px solid ${C.borderLight};overflow:hidden;
  display:flex;flex-direction:column;
}
.tm-sk-band{height:78px;background:${C.faintGreen}}
.tm-sk-body{
  padding:0 22px 22px;display:flex;flex-direction:column;
  align-items:center;gap:10px;margin-top:-46px;position:relative;
}

.tm-state{
  text-align:center;padding:56px 28px;border-radius:20px;
  display:flex;flex-direction:column;align-items:center;
  margin-bottom:32px;max-width:520px;margin-left:auto;margin-right:auto;
}
.tm-state.err{background:${C.redSoft};border:1px solid #fecaca}
.tm-state.nil{background:${C.ghostGreen};border:1px solid ${C.softGreen}}
.tm-state-ic{
  width:64px;height:64px;border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:16px;
}
.tm-state.err .tm-state-ic{background:#fee2e2;color:${C.red}}
.tm-state.nil .tm-state-ic{
  background:linear-gradient(135deg,${C.softGreen},${C.paleGreen});
  color:${C.medGreen};
}
.tm-state h3{
  font-family:'Playfair Display',serif;
  font-size:20px;font-weight:700;color:${C.ink};margin:0 0 8px;
}
.tm-state p{
  font-size:14px;color:${C.textMuted};
  margin:0 0 20px;line-height:1.6;max-width:400px;
}
.tm-abtn{
  display:inline-flex;align-items:center;gap:7px;
  padding:11px 22px;border-radius:10px;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;border:none;
}
.tm-abtn.retry{background:${C.white};border:1.5px solid ${C.red};color:${C.red}}
.tm-abtn.retry:hover{
  background:${C.red};color:${C.white};transform:translateY(-1px);
  box-shadow:0 4px 12px rgba(220,38,38,.25);
}
.tm-abtn.reset{
  background:linear-gradient(135deg,${C.darkGreen},${C.green});
  color:${C.white};box-shadow:0 4px 12px rgba(6,78,59,.22);
}
.tm-abtn.reset:hover{
  transform:translateY(-1px);
  box-shadow:0 6px 16px rgba(6,78,59,.32);
}

.tm-cta{
  background:
    radial-gradient(ellipse at top left,${C.green} 0%,transparent 55%),
    radial-gradient(ellipse at bottom right,${C.medGreen} 0%,transparent 55%),
    linear-gradient(135deg,${C.ink} 0%,${C.darkGreen} 100%);
  border-radius:24px;
  padding:clamp(36px,5vw,56px) clamp(24px,4vw,48px);
  text-align:center;position:relative;overflow:hidden;
}
.tm-cta::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,
    transparent,${C.brightGreen},${C.paleGreen},${C.brightGreen},transparent);
}
.tm-cta::after{
  content:'';position:absolute;inset:0;
  background-image:
    radial-gradient(circle at 20% 30%,rgba(16,185,129,.08) 0%,transparent 30%),
    radial-gradient(circle at 80% 70%,rgba(167,243,208,.06) 0%,transparent 30%);
  pointer-events:none;
}
.tm-cta-inner{position:relative;z-index:1}
.tm-cta-eyebrow{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 14px;border-radius:999px;
  background:rgba(16,185,129,.15);
  border:1px solid rgba(167,243,208,.2);
  color:${C.paleGreen};font-size:11px;font-weight:700;
  text-transform:uppercase;letter-spacing:.12em;margin-bottom:14px;
}
.tm-cta-h{
  font-family:'Playfair Display',serif;
  font-size:clamp(22px,3.5vw,30px);font-weight:800;
  color:${C.white};margin:0 0 10px;letter-spacing:-.015em;
}
.tm-cta-p{
  font-size:14.5px;color:rgba(255,255,255,.72);
  line-height:1.7;max-width:460px;margin:0 auto 24px;font-weight:400;
}
.tm-cta-row{
  display:flex;gap:12px;justify-content:center;flex-wrap:wrap;
}

@media(max-width:1024px){
  .tm-grid{grid-template-columns:repeat(2,1fr);gap:20px}
}
@media(max-width:640px){
  .tm-grid{grid-template-columns:1fr;gap:18px}
  .tm-cta-row{flex-direction:column;align-items:stretch;max-width:280px;margin:0 auto}
  .tm-filters{gap:6px}
  .tm-fbtn{padding:7px 13px;font-size:12px}
  .tm-card-body{padding:0 18px 18px}
  .tm-avatar{width:88px;height:88px}
}
@media(max-width:400px){
  .tm-avatar{width:80px;height:80px}
  .tm-name{font-size:16.5px}
}
@media(prefers-reduced-motion:reduce){
  .tm-card,.tm-slink,.tm-avatar-img,.tm-fbtn,.tm-abtn{transition:none!important}
  .tm-sk{animation:none!important}
  .tm-card:hover{transform:none}
}
`;

let _injected = false;
function injectStyles() {
  if (_injected || typeof document === "undefined") return;
  if (document.getElementById("tm-st")) {
    _injected = true;
    return;
  }
  const s = document.createElement("style");
  s.id = "tm-st";
  s.textContent = STYLES;
  document.head.appendChild(s);
  _injected = true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════════════════════ */

function Skeleton() {
  const b = (w, h, r = 6) => (
    <div className="tm-sk" style={{ width: w, height: h, borderRadius: r }} />
  );
  return (
    <div className="tm-sk-card" aria-hidden="true">
      <div className="tm-sk-band" />
      <div className="tm-sk-body">
        <div
          className="tm-sk"
          style={{
            width: 96, height: 96, borderRadius: "50%",
            border: `4px solid ${C.white}`, boxSizing: "content-box",
          }}
        />
        {b("60%", 18)}
        {b("40%", 13)}
        {b("30%", 20, 6)}
        <div style={{ height: 4 }} />
        {b("90%", 12)}
        {b("80%", 12)}
        {b("70%", 12)}
        <div
          style={{
            display: "flex", gap: 6, paddingTop: 14,
            borderTop: `1px solid ${C.borderLight}`,
            marginTop: 10, width: "100%", justifyContent: "center",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="tm-sk"
              style={{ width: 34, height: 34, borderRadius: 9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARD
═══════════════════════════════════════════════════════════════════════════ */

function Card({ member }) {
  const [imgState, setImgState] = useState("loading");

  const expertise = member.expertise || [];
  const languages = member.languages || [];
  const certs     = member.certifications || [];

  const socials = [
    member.linkedin_url && {
      href: member.linkedin_url, icon: <FiLinkedin size={14} />, label: "LinkedIn",
    },
    member.twitter_url && {
      href: member.twitter_url, icon: <FiTwitter size={14} />, label: "Twitter",
    },
    member.instagram_url && {
      href: member.instagram_url, icon: <FiInstagram size={14} />, label: "Instagram",
    },
    member.facebook_url && {
      href: member.facebook_url, icon: <FiFacebook size={14} />, label: "Facebook",
    },
    member.website_url && {
      href: member.website_url, icon: <FiExternalLink size={14} />, label: "Website",
    },
    member.email && {
      href: `mailto:${member.email}`, icon: <FiMail size={14} />, label: "Email", int: true,
    },
    member.phone && {
      href: `tel:${member.phone}`, icon: <FiPhone size={14} />, label: "Phone", int: true,
    },
  ].filter(Boolean);

  const initials = member.name
    ? member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const imageSrc = member.image_url;

  return (
    <article className="tm-card" role="listitem">
      <div className="tm-card-band" aria-hidden="true" />

      {member.is_featured && (
        <div className="tm-feat">
          <FiStar size={10} fill="currentColor" /> Featured
        </div>
      )}

      <div className="tm-card-body">
        <div className="tm-avatar">
          <div className="tm-avatar-ring">
            {imgState === "loading" && imageSrc && (
              <div
                className="tm-sk"
                style={{ position: "absolute", inset: 0, borderRadius: "50%" }}
              />
            )}
            {imgState === "error" || !imageSrc ? (
              <div className="tm-avatar-fb">
                <span className="tm-avatar-in">{initials}</span>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={`${member.name} profile`}
                className="tm-avatar-img"
                style={{ opacity: imgState === "loaded" ? 1 : 0 }}
                onLoad={() => setImgState("loaded")}
                onError={() => setImgState("error")}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
          <div
            className="tm-dot"
            style={{
              backgroundColor: member.is_active ? C.brightGreen : "#9ca3af",
            }}
            title={member.is_active ? "Active" : "Inactive"}
          />
        </div>

        <h3 className="tm-name">{member.name}</h3>
        {member.role && <p className="tm-role">{member.role}</p>}
        {member.department && (
          <span className="tm-dept">{member.department}</span>
        )}

        <div className="tm-divider" />

        {member.bio && <p className="tm-bio">{member.bio}</p>}

        {expertise.length > 0 && (
          <div className="tm-tags">
            {expertise.slice(0, 3).map((s, i) => (
              <span key={i} className="tm-tag">{s}</span>
            ))}
            {expertise.length > 3 && (
              <span className="tm-tag-x">+{expertise.length - 3}</span>
            )}
          </div>
        )}

        {(languages.length > 0 || certs.length > 0 ||
          member.years_experience > 0 || member.location) && (
          <div className="tm-meta">
            {languages.length > 0 && (
              <div className="tm-mi">
                <FiGlobe size={11} />
                <span>
                  {languages.slice(0, 3).join(", ")}
                  {languages.length > 3 && ` +${languages.length - 3}`}
                </span>
              </div>
            )}
            {certs.length > 0 && (
              <div className="tm-mi tm-mi-award">
                <FiAward size={11} />
                <span>
                  {certs[0]}
                  {certs.length > 1 && ` +${certs.length - 1}`}
                </span>
              </div>
            )}
            {member.years_experience > 0 && (
              <div className="tm-mi">
                <FiCalendar size={11} />
                <span>{member.years_experience}+ years experience</span>
              </div>
            )}
            {member.location && (
              <div className="tm-mi">
                <FiMapPin size={11} />
                <span>{member.location}</span>
              </div>
            )}
          </div>
        )}

        {socials.length > 0 && (
          <div className="tm-socials">
            {socials.map((lk, i) => (
              <a
                key={i}
                href={lk.href}
                target={lk.int ? undefined : "_blank"}
                rel={lk.int ? undefined : "noopener noreferrer"}
                className="tm-slink"
                aria-label={lk.label}
                title={lk.label}
              >
                {lk.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTERS
═══════════════════════════════════════════════════════════════════════════ */

function Filters({ departments, active, onFilter, counts }) {
  const [open, setOpen] = useState(false);
  const vis = open ? departments : departments.slice(0, 5);
  const more = departments.length > 5;

  return (
    <div className="tm-filters">
      <button
        onClick={() => onFilter("all")}
        className={`tm-fbtn ${active === "all" ? "on" : ""}`}
      >
        All
        {counts.all > 0 && <span className="tm-fcount">{counts.all}</span>}
      </button>
      {vis.map((n) => (
        <button
          key={n}
          onClick={() => onFilter(n)}
          className={`tm-fbtn ${active === n ? "on" : ""}`}
        >
          {n}
          {counts[n] > 0 && <span className="tm-fcount">{counts[n]}</span>}
        </button>
      ))}
      {more && (
        <button className="tm-fmore" onClick={() => setOpen((v) => !v)}>
          <FiChevronDown
            size={13}
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform .25s",
            }}
          />
          {open ? "Show less" : `+${departments.length - 5} more`}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const TeamContent = () => {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("all");
  const mounted = useRef(true);

  useEffect(() => {
    injectStyles();
  }, []);

  const load = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const [mR, dR] = await Promise.allSettled([
        teamAPI.getAll({
          sort: "display_order",
          order: "ASC",
          limit: 100,
        }),
        teamAPI.getDepartments(),
      ]);

      if (!mounted.current) return;

      // Members
      if (mR.status === "fulfilled") {
        const raw = extractList(mR.value);
        const normalized = raw.map(normalizeMember);
        setMembers(normalized);
        setFiltered(normalized);
      } else {
        throw new Error(
          mR.reason?.message || "Failed to load team members from server"
        );
      }

      // Departments
      if (dR.status === "fulfilled") {
        setDepts(normalizeDepartments(dR.value));
      } else if (mR.status === "fulfilled") {
        const raw = extractList(mR.value).map(normalizeMember);
        setDepts(
          [...new Set(raw.map((m) => m.department).filter(Boolean))].sort()
        );
      }
    } catch (err) {
      if (!mounted.current) return;
      setMembers([]);
      setFiltered([]);
      setDepts([]);
      setError(err.message || "Unable to reach the server. Please try again.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  useEffect(() => {
    setFiltered(
      active === "all"
        ? members
        : members.filter(
            (m) => (m.department || "").toLowerCase() === active.toLowerCase()
          )
    );
  }, [active, members]);

  const counts = useMemo(() => {
    const c = { all: members.length };
    members.forEach((m) => {
      if (m.department) c[m.department] = (c[m.department] || 0) + 1;
    });
    return c;
  }, [members]);

  const retry = useCallback(() => {
    setActive("all");
    load();
  }, [load]);

  return (
    <section className="tm-root">
      <div className="tm-wrap">
        <AnimatedSection animation="fadeInUp">
          <div className="tm-head">
            <span className="tm-eyebrow">
              <FiUsers size={12} /> Our Experts
            </span>
            <h2 className="tm-h2">
              Meet Our <em>Team</em>
            </h2>
            <p className="tm-sub">
              Dedicated professionals delivering seamless and authentic
              East African travel experiences with passion, expertise,
              and unwavering commitment.
            </p>
          </div>
        </AnimatedSection>

        {depts.length > 0 && !loading && !error && (
          <AnimatedSection animation="fadeInUp">
            <Filters
              departments={depts}
              active={active}
              onFilter={setActive}
              counts={counts}
            />
          </AnimatedSection>
        )}

        {error && !loading && (
          <AnimatedSection animation="fadeInUp">
            <div className="tm-state err">
              <div className="tm-state-ic">
                <FiWifiOff size={30} />
              </div>
              <h3>Unable to Load Team</h3>
              <p>{error}</p>
              <button className="tm-abtn retry" onClick={retry}>
                <FiRefreshCw size={14} /> Try Again
              </button>
            </div>
          </AnimatedSection>
        )}

        {!error && (
          <div className="tm-grid" role="list">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <AnimatedSection
                    key={i}
                    animation="fadeInUp"
                    delay={i * 0.05}
                  >
                    <Skeleton />
                  </AnimatedSection>
                ))
              : filtered.map((m, i) => (
                  <AnimatedSection
                    key={m.id || i}
                    animation="fadeInUp"
                    delay={i * 0.06}
                  >
                    <Card member={m} />
                  </AnimatedSection>
                ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <AnimatedSection animation="fadeInUp">
            <div className="tm-state nil">
              <div className="tm-state-ic">
                <FiUsers size={30} />
              </div>
              <h3>No Team Members Found</h3>
              <p>
                {active !== "all"
                  ? `No members currently listed in the "${active}" department.`
                  : "Our team roster is being prepared. Check back soon!"}
              </p>
              {active !== "all" && (
                <button
                  className="tm-abtn reset"
                  onClick={() => setActive("all")}
                >
                  View All Members
                </button>
              )}
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection animation="fadeInUp">
          <div className="tm-cta">
            <div className="tm-cta-inner">
              <span className="tm-cta-eyebrow">
                <FiArrowRight size={11} /> Get Started
              </span>
              <h3 className="tm-cta-h">Ready to Start Your Adventure?</h3>
              <p className="tm-cta-p">
                Connect with our team of experts to plan your
                transformative East African journey — tailored to your
                interests, pace, and passions.
              </p>
              <div className="tm-cta-row">
                <Button
                  to="/contact"
                  variant="primary"
                  icon={<FiArrowRight size={15} />}
                >
                  Contact Our Team
                </Button>
                <Button to="/destinations" variant="outline">
                  Explore Destinations
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TeamContent;