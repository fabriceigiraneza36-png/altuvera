// src/components/common/TeamContent.jsx — Dark Green & White Professional Redesign
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import {
  FiArrowRight, FiLinkedin, FiMail, FiTwitter, FiInstagram,
  FiExternalLink, FiMapPin, FiAward, FiUsers, FiGlobe,
  FiPhone, FiCalendar, FiRefreshCw, FiAlertCircle, FiChevronDown,
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";

/* ── API ── */
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api";

const teamAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal, headers: { Accept: "application/json", ...options.headers } });
      clearTimeout(timeout);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `Status ${res.status}`); }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (retries > 0 && err.name !== "AbortError" && !err.message.includes("status")) {
        await new Promise(r => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },
  getAll(params = {}) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
  getDepartments() { return this._fetch("/team/departments/list"); },
};

/* ── Fallback ── */
const FALLBACK_MEMBERS = [
  { id: 1, name: "IGIRANEZA Fabrice", role: "Founder & CEO", department: "Leadership", image_url: "https://randomuser.me/api/portraits/men/32.jpg", bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.", expertise: ["Strategic Planning", "Tourism Innovation"], languages: ["English", "French", "Kinyarwanda"], certifications: [], years_experience: 12, location: "Musanze, Rwanda", linkedin_url: "#", twitter_url: "#", email: "fabrice@altuvera.com", is_featured: true, is_active: true, display_order: 1 },
  { id: 2, name: "UWIMANA Grace", role: "Head of Operations", department: "Operations", image_url: "https://randomuser.me/api/portraits/women/44.jpg", bio: "Ensures seamless coordination of every itinerary with precision and local expertise.", expertise: ["Logistics", "Quality Assurance"], languages: ["English", "Swahili"], certifications: [], years_experience: 8, location: "Musanze, Rwanda", linkedin_url: "#", email: "grace@altuvera.com", is_featured: false, is_active: true, display_order: 2 },
  { id: 3, name: "MUTABAZI Jean", role: "Lead Safari Guide", department: "Guides", image_url: "https://randomuser.me/api/portraits/men/67.jpg", bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards.", expertise: ["Wildlife Tracking", "Conservation"], languages: ["English", "Swahili", "French"], certifications: ["Certified Safari Guide"], years_experience: 15, location: "Serengeti, Tanzania", linkedin_url: "#", email: "jean@altuvera.com", is_featured: true, is_active: true, display_order: 3 },
  { id: 4, name: "INGABIRE Diane", role: "Customer Experience Manager", department: "Customer Service", image_url: "https://randomuser.me/api/portraits/women/28.jpg", bio: "Designs guest-first service experiences from initial inquiry through post-trip follow-up.", expertise: ["Client Relations", "Service Design"], languages: ["English", "French"], certifications: [], years_experience: 6, location: "Kampala, Uganda", linkedin_url: "#", twitter_url: "#", email: "diane@altuvera.com", is_featured: false, is_active: true, display_order: 4 },
  { id: 5, name: "HABIMANA Patrick", role: "Conservation Liaison", department: "Conservation", image_url: "https://randomuser.me/api/portraits/men/52.jpg", bio: "Manages partnerships with wildlife conservancies and oversees community development initiatives.", expertise: ["Conservation Strategy", "Community Engagement"], languages: ["English", "Rukiga"], certifications: ["Conservation Certificate"], years_experience: 10, location: "Bwindi, Uganda", linkedin_url: "#", email: "patrick@altuvera.com", is_featured: false, is_active: true, display_order: 5 },
  { id: 6, name: "MUKAMANA Claudine", role: "Marketing Director", department: "Marketing", image_url: "https://randomuser.me/api/portraits/women/65.jpg", bio: "Leads brand strategy and digital marketing to connect travelers with authentic African experiences.", expertise: ["Digital Marketing", "Brand Strategy"], languages: ["English", "French", "Kinyarwanda"], certifications: [], years_experience: 7, location: "Musanze, Rwanda", linkedin_url: "#", twitter_url: "#", instagram_url: "#", email: "claudine@altuvera.com", is_featured: false, is_active: true, display_order: 6 },
];

/* ── Palette ── */
const C = {
  darkGreen: "#064e3b",
  green: "#065f46",
  medGreen: "#047857",
  lightGreen: "#059669",
  paleGreen: "#d1fae5",
  faintGreen: "#ecfdf5",
  ghostGreen: "#f0fdf4",
  white: "#ffffff",
  offWhite: "#fafffe",
  textDark: "#064e3b",
  textMed: "#065f46",
  textLight: "#047857",
  textMuted: "#6b7280",
  border: "#d1fae5",
  borderLight: "#e5f5ee",
};

/* ── Styles ── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

.tm-root{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
  -webkit-font-smoothing:antialiased;
  padding:clamp(40px,5vw,72px) clamp(16px,3vw,40px);
  background:${C.white};
  position:relative;
}

.tm-wrap{max-width:1160px;margin:0 auto;position:relative;z-index:1}

/* Heading */
.tm-head{text-align:center;margin-bottom:28px}
.tm-h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(26px,4.2vw,42px);font-weight:800;
  color:${C.darkGreen};margin:0 0 10px;line-height:1.18;letter-spacing:-.02em;
}
.tm-h2 em{font-style:normal;color:${C.lightGreen}}
.tm-sub{
  font-size:clamp(13.5px,1.6vw,15.5px);color:${C.textMuted};
  line-height:1.7;max-width:560px;margin:0 auto;
}

/* Banner */
.tm-banner{
  display:flex;align-items:center;justify-content:center;gap:7px;
  padding:9px 16px;background:${C.ghostGreen};border:1px solid ${C.paleGreen};
  border-radius:10px;margin-bottom:20px;color:${C.green};font-size:12.5px;
}
.tm-banner button{
  background:none;border:none;color:${C.lightGreen};font-weight:700;
  cursor:pointer;text-decoration:underline;font-family:inherit;font-size:12.5px;margin-left:3px;
}

/* Filters */
.tm-filters{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-bottom:28px}
.tm-fbtn{
  display:inline-flex;align-items:center;gap:5px;
  padding:7px 16px;border-radius:8px;
  border:1.5px solid ${C.paleGreen};background:${C.white};
  color:${C.green};font-family:'Inter',sans-serif;font-size:12.5px;font-weight:600;
  cursor:pointer;transition:all .18s ease;
}
.tm-fbtn:hover{background:${C.ghostGreen};border-color:${C.paleGreen}}
.tm-fbtn.on{
  background:${C.darkGreen};border-color:${C.darkGreen};color:${C.white};
  box-shadow:0 2px 8px rgba(6,78,59,.22);
}
.tm-fcount{
  min-width:16px;height:16px;padding:0 4px;border-radius:4px;
  background:rgba(6,78,59,.08);font-size:9.5px;font-weight:800;
  display:inline-flex;align-items:center;justify-content:center;color:inherit;
}
.tm-fbtn.on .tm-fcount{background:rgba(255,255,255,.18);color:${C.white}}
.tm-fmore{
  display:inline-flex;align-items:center;gap:4px;
  padding:7px 13px;border-radius:8px;border:1.5px dashed ${C.paleGreen};
  background:transparent;color:${C.lightGreen};font-family:'Inter',sans-serif;
  font-size:12px;font-weight:600;cursor:pointer;transition:all .18s;
}
.tm-fmore:hover{background:${C.ghostGreen}}

/* Grid */
.tm-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:22px;margin-bottom:32px;
}

/* ═══════════ CARD ═══════════ */
.tm-card{
  background:${C.white};
  border-radius:16px;
  border:1.5px solid ${C.borderLight};
  padding:24px 20px 20px;
  text-align:center;
  display:flex;flex-direction:column;
  transition:all .28s cubic-bezier(.4,0,.2,1);
  position:relative;
}
.tm-card:hover{
  transform:translateY(-5px);
  border-color:${C.paleGreen};
  box-shadow:0 16px 40px rgba(6,78,59,.1);
}
.tm-card::after{
  content:'';position:absolute;bottom:0;left:20px;right:20px;
  height:2px;border-radius:2px;
  background:linear-gradient(90deg,${C.lightGreen},${C.medGreen});
  opacity:0;transition:opacity .25s;
}
.tm-card:hover::after{opacity:1}

/* Featured */
.tm-feat{
  position:absolute;top:12px;right:12px;
  display:flex;align-items:center;gap:3px;
  padding:3px 9px;border-radius:6px;
  background:${C.faintGreen};border:1px solid ${C.paleGreen};
  color:${C.lightGreen};font-size:9.5px;font-weight:800;
  text-transform:uppercase;letter-spacing:.03em;
}

/* Avatar */
.tm-avatar{
  width:88px;height:88px;
  border-radius:50%;
  margin:0 auto 14px;
  position:relative;
  flex-shrink:0;
}
.tm-avatar-ring{
  width:100%;height:100%;border-radius:50%;
  overflow:hidden;
  border:3px solid ${C.paleGreen};
  background:${C.faintGreen};
  transition:border-color .25s;
}
.tm-card:hover .tm-avatar-ring{border-color:${C.lightGreen}}
.tm-avatar-img{
  width:100%;height:100%;object-fit:cover;
  display:block;
  transition:transform .4s ease,opacity .35s ease;
}
.tm-card:hover .tm-avatar-img{transform:scale(1.06)}
.tm-avatar-fb{
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,${C.faintGreen},${C.paleGreen});
  border-radius:50%;
}
.tm-avatar-in{
  font-family:'Playfair Display',serif;
  font-size:28px;font-weight:800;color:${C.lightGreen};
}
.tm-dot{
  position:absolute;bottom:2px;right:2px;
  width:12px;height:12px;border-radius:50%;
  border:2.5px solid ${C.white};
}

/* Text */
.tm-name{
  font-family:'Playfair Display',serif;
  font-size:17px;font-weight:700;color:${C.darkGreen};
  margin:0 0 3px;line-height:1.25;
}
.tm-role{font-size:13px;color:${C.lightGreen};font-weight:600;margin:0 0 6px}
.tm-dept{
  display:inline-block;padding:2px 10px;border-radius:5px;
  background:${C.ghostGreen};border:1px solid ${C.paleGreen};
  font-size:10px;color:${C.medGreen};font-weight:700;
  text-transform:uppercase;letter-spacing:.03em;margin-bottom:10px;
}
.tm-bio{
  font-size:12.5px;color:${C.textMuted};line-height:1.65;
  margin:0 0 12px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}

/* Tags */
.tm-tags{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-bottom:10px}
.tm-tag{
  padding:2px 8px;border-radius:5px;
  background:${C.ghostGreen};border:1px solid ${C.borderLight};
  font-size:10px;color:${C.green};font-weight:600;
}
.tm-tag-x{
  padding:2px 7px;border-radius:5px;
  background:${C.faintGreen};font-size:10px;color:${C.lightGreen};font-weight:700;
}

/* Meta */
.tm-meta{display:flex;flex-direction:column;gap:3px;margin-bottom:12px}
.tm-mi{
  display:flex;align-items:center;justify-content:center;
  gap:5px;font-size:11px;color:${C.textMuted};
}
.tm-mi svg{flex-shrink:0;color:${C.paleGreen}}

/* Socials */
.tm-socials{
  display:flex;justify-content:center;gap:6px;
  padding-top:12px;border-top:1px solid ${C.borderLight};margin-top:auto;
}
.tm-slink{
  width:30px;height:30px;border-radius:8px;
  border:1.5px solid ${C.borderLight};background:${C.white};
  color:${C.green};display:flex;align-items:center;justify-content:center;
  text-decoration:none;transition:all .18s;
}
.tm-slink:hover{
  background:${C.darkGreen};border-color:${C.darkGreen};color:${C.white};
  transform:translateY(-1px);box-shadow:0 3px 8px rgba(6,78,59,.2);
}

/* Skeleton */
.tm-sk{
  background:linear-gradient(110deg,${C.borderLight} 8%,${C.ghostGreen} 18%,${C.borderLight} 33%);
  background-size:200% 100%;animation:tmShim 1.4s ease-in-out infinite;border-radius:6px;
}
@keyframes tmShim{from{background-position:-200% 0}to{background-position:200% 0}}
.tm-sk-card{
  background:${C.white};border-radius:16px;border:1.5px solid ${C.borderLight};
  padding:24px 20px 20px;display:flex;flex-direction:column;align-items:center;gap:8px;
}

/* State boxes */
.tm-state{
  text-align:center;padding:44px 24px;border-radius:16px;
  display:flex;flex-direction:column;align-items:center;margin-bottom:24px;
}
.tm-state.err{background:#fef2f2;border:1px solid #fecaca}
.tm-state.nil{background:${C.ghostGreen};border:1px solid ${C.paleGreen}}
.tm-state h3{
  font-family:'Playfair Display',serif;font-size:17px;font-weight:700;
  color:${C.darkGreen};margin:10px 0 5px;
}
.tm-state p{font-size:13px;color:${C.textMuted};margin:0 0 16px;line-height:1.55}
.tm-abtn{
  display:flex;align-items:center;gap:6px;
  padding:9px 20px;border-radius:9px;font-family:'Inter',sans-serif;
  font-size:12.5px;font-weight:700;cursor:pointer;transition:all .18s;border:none;
}
.tm-abtn.retry{background:#fef2f2;border:1.5px solid #f87171;color:#dc2626}
.tm-abtn.retry:hover{background:#fee2e2;transform:translateY(-1px)}
.tm-abtn.reset{background:${C.darkGreen};color:${C.white};box-shadow:0 2px 8px rgba(6,78,59,.18)}
.tm-abtn.reset:hover{background:${C.green};transform:translateY(-1px)}

/* CTA */
.tm-cta{
  background:${C.darkGreen};border-radius:18px;
  padding:clamp(32px,4.5vw,48px) clamp(20px,4vw,44px);
  text-align:center;position:relative;overflow:hidden;
}
.tm-cta::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,${C.lightGreen},${C.paleGreen},${C.lightGreen});
}
.tm-cta-h{
  font-family:'Playfair Display',serif;
  font-size:clamp(19px,3.2vw,26px);font-weight:800;
  color:${C.white};margin:0 0 8px;
}
.tm-cta-p{
  font-size:14px;color:rgba(255,255,255,.6);
  line-height:1.65;max-width:420px;margin:0 auto 20px;
}
.tm-cta-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}

/* Responsive */
@media(max-width:960px){.tm-grid{grid-template-columns:repeat(2,1fr);gap:18px}}
@media(max-width:580px){
  .tm-grid{grid-template-columns:1fr;gap:14px}
  .tm-cta-row{flex-direction:column;align-items:center}
}
@media(prefers-reduced-motion:reduce){
  .tm-card,.tm-slink,.tm-avatar-img{transition:none!important}
  .tm-sk{animation:none!important}
}
`;

let _injected = false;
function injectStyles() {
  if (_injected || typeof document === "undefined") return;
  if (document.getElementById("tm-st")) { _injected = true; return; }
  const s = document.createElement("style");
  s.id = "tm-st";
  s.textContent = STYLES;
  document.head.appendChild(s);
  _injected = true;
}

/* ── Skeleton ── */
function Skeleton() {
  const b = (w, h) => <div className="tm-sk" style={{ width: w, height: h }} />;
  return (
    <div className="tm-sk-card" aria-hidden="true">
      <div className="tm-sk" style={{ width: 88, height: 88, borderRadius: "50%" }} />
      {b("60%", 16)}{b("40%", 13)}{b("30%", 18)}{b("85%", 11)}{b("70%", 11)}
      <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: `1px solid ${C.borderLight}`, marginTop: 6, width: "100%", justifyContent: "center" }}>
        {[1, 2, 3].map(i => <div key={i} className="tm-sk" style={{ width: 30, height: 30, borderRadius: 8 }} />)}
      </div>
    </div>
  );
}

/* ── Card ── */
function Card({ member }) {
  const [imgState, setImgState] = useState("loading");

  const expertise = Array.isArray(member.expertise) ? member.expertise : [];
  const languages = Array.isArray(member.languages) ? member.languages : [];
  const certs = Array.isArray(member.certifications) ? member.certifications : [];

  const socials = [
    member.linkedin_url && { href: member.linkedin_url, icon: <FiLinkedin size={13} />, label: "LinkedIn" },
    member.twitter_url && { href: member.twitter_url, icon: <FiTwitter size={13} />, label: "Twitter" },
    member.instagram_url && { href: member.instagram_url, icon: <FiInstagram size={13} />, label: "Instagram" },
    member.website_url && { href: member.website_url, icon: <FiExternalLink size={13} />, label: "Website" },
    member.email && { href: `mailto:${member.email}`, icon: <FiMail size={13} />, label: "Email", int: true },
    member.phone && { href: `tel:${member.phone}`, icon: <FiPhone size={13} />, label: "Phone", int: true },
  ].filter(Boolean);

  const initials = member.name
    ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <article className="tm-card" role="listitem">
      {member.is_featured && (
        <div className="tm-feat"><FiAward size={9} /> Featured</div>
      )}

      <div className="tm-avatar">
        <div className="tm-avatar-ring">
          {imgState === "loading" && member.image_url && (
            <div className="tm-sk" style={{ position: "absolute", inset: 0, borderRadius: "50%" }} />
          )}
          {(imgState === "error" || !member.image_url) ? (
            <div className="tm-avatar-fb">
              <span className="tm-avatar-in">{initials}</span>
            </div>
          ) : (
            <img
              src={member.image_url}
              alt={`${member.name}`}
              className="tm-avatar-img"
              style={{ opacity: imgState === "loaded" ? 1 : 0 }}
              onLoad={() => setImgState("loaded")}
              onError={() => setImgState("error")}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div className="tm-dot" style={{ backgroundColor: member.is_active ? C.lightGreen : "#9ca3af" }} />
      </div>

      <h3 className="tm-name">{member.name}</h3>
      <p className="tm-role">{member.role}</p>
      {member.department && <span className="tm-dept">{member.department}</span>}
      {member.bio && <p className="tm-bio">{member.bio}</p>}

      {expertise.length > 0 && (
        <div className="tm-tags">
          {expertise.slice(0, 3).map((s, i) => <span key={i} className="tm-tag">{s}</span>)}
          {expertise.length > 3 && <span className="tm-tag-x">+{expertise.length - 3}</span>}
        </div>
      )}

      <div className="tm-meta">
        {languages.length > 0 && (
          <div className="tm-mi">
            <FiGlobe size={10} />
            <span>{languages.slice(0, 3).join(", ")}{languages.length > 3 ? ` +${languages.length - 3}` : ""}</span>
          </div>
        )}
        {certs.length > 0 && (
          <div className="tm-mi" style={{ color: "#b45309" }}>
            <FiAward size={10} style={{ color: "#f59e0b" }} />
            <span>{certs[0]}{certs.length > 1 ? ` +${certs.length - 1}` : ""}</span>
          </div>
        )}
        {member.years_experience > 0 && (
          <div className="tm-mi"><FiCalendar size={10} /><span>{member.years_experience}+ yrs experience</span></div>
        )}
        {member.location && (
          <div className="tm-mi"><FiMapPin size={10} /><span>{member.location}</span></div>
        )}
      </div>

      {socials.length > 0 && (
        <div className="tm-socials">
          {socials.map((lk, i) => (
            <a
              key={i} href={lk.href}
              target={lk.int ? undefined : "_blank"}
              rel={lk.int ? undefined : "noopener noreferrer"}
              className="tm-slink" aria-label={lk.label} title={lk.label}
            >{lk.icon}</a>
          ))}
        </div>
      )}
    </article>
  );
}

/* ── Filter bar ── */
function Filters({ departments, active, onFilter, counts }) {
  const [open, setOpen] = useState(false);
  const vis = open ? departments : departments.slice(0, 5);
  const more = departments.length > 5;

  return (
    <div className="tm-filters">
      <button onClick={() => onFilter("all")} className={`tm-fbtn ${active === "all" ? "on" : ""}`}>
        All{counts.all > 0 && <span className="tm-fcount">{counts.all}</span>}
      </button>
      {vis.map(d => {
        const n = typeof d === "string" ? d : d.name;
        return (
          <button key={n} onClick={() => onFilter(n)} className={`tm-fbtn ${active === n ? "on" : ""}`}>
            {n}{counts[n] > 0 && <span className="tm-fcount">{counts[n]}</span>}
          </button>
        );
      })}
      {more && (
        <button className="tm-fmore" onClick={() => setOpen(v => !v)}>
          <FiChevronDown size={12} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          {open ? "Less" : `+${departments.length - 5}`}
        </button>
      )}
    </div>
  );
}

/* ══════════ MAIN ══════════ */
const TeamContent = () => {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("all");
  const [fallback, setFallback] = useState(false);
  const mounted = useRef(true);

  useEffect(() => { injectStyles(); }, []);

  const load = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true); setError(null); setFallback(false);
    try {
      const [mR, dR] = await Promise.allSettled([
        teamAPI.getAll({ sort: "display_order", order: "ASC", limit: 100 }),
        teamAPI.getDepartments(),
      ]);
      if (!mounted.current) return;
      if (mR.status === "fulfilled") {
        const a = Array.isArray(mR.value.data) ? mR.value.data : (Array.isArray(mR.value) ? mR.value : []);
        setMembers(a); setFiltered(a);
      } else throw new Error(mR.reason?.message || "Fetch failed");
      if (dR.status === "fulfilled") {
        setDepts(Array.isArray(dR.value.data) ? dR.value.data : []);
      } else if (mR.status === "fulfilled") {
        const a = Array.isArray(mR.value.data) ? mR.value.data : [];
        setDepts([...new Set(a.map(m => m.department).filter(Boolean))].sort());
      }
    } catch {
      if (!mounted.current) return;
      setMembers(FALLBACK_MEMBERS); setFiltered(FALLBACK_MEMBERS);
      setDepts([...new Set(FALLBACK_MEMBERS.map(m => m.department).filter(Boolean))].sort());
      setFallback(true);
    } finally { if (mounted.current) setLoading(false); }
  }, []);

  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, [load]);

  useEffect(() => {
    setFiltered(active === "all" ? members : members.filter(m => m.department?.toLowerCase() === active.toLowerCase()));
  }, [active, members]);

  const counts = useMemo(() => {
    const c = { all: members.length };
    members.forEach(m => { if (m.department) c[m.department] = (c[m.department] || 0) + 1; });
    return c;
  }, [members]);

  const retry = useCallback(() => { setActive("all"); load(); }, [load]);

  return (
    <section className="tm-root">
      <div className="tm-wrap">

        <AnimatedSection animation="fadeInUp">
          <div className="tm-head">
            <h2 className="tm-h2">Meet Our <em>Team</em></h2>
            <p className="tm-sub">
              Dedicated professionals delivering seamless and authentic East African travel experiences.
            </p>
          </div>
        </AnimatedSection>

        {fallback && !loading && (
          <AnimatedSection animation="fadeInUp">
            <div className="tm-banner">
              <FiAlertCircle size={13} />
              <span>Showing preview data — live data loads when the server is available.</span>
              <button onClick={retry}>Retry</button>
            </div>
          </AnimatedSection>
        )}

        {depts.length > 0 && !loading && (
          <AnimatedSection animation="fadeInUp">
            <Filters departments={depts} active={active} onFilter={setActive} counts={counts} />
          </AnimatedSection>
        )}

        {error && (
          <AnimatedSection animation="fadeInUp">
            <div className="tm-state err">
              <FiAlertCircle size={34} color="#f87171" />
              <h3>Failed to Load Team</h3>
              <p>{error}</p>
              <button className="tm-abtn retry" onClick={retry}><FiRefreshCw size={13} /> Try Again</button>
            </div>
          </AnimatedSection>
        )}

        <div className="tm-grid" role="list">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.05}>
                <Skeleton />
              </AnimatedSection>
            ))
            : filtered.map((m, i) => (
              <AnimatedSection key={m.id || i} animation="fadeInUp" delay={i * 0.06}>
                <Card member={m} />
              </AnimatedSection>
            ))
          }
        </div>

        {!loading && !error && filtered.length === 0 && (
          <AnimatedSection animation="fadeInUp">
            <div className="tm-state nil">
              <FiUsers size={36} style={{ color: C.paleGreen }} />
              <h3>No Team Members Found</h3>
              <p>{active !== "all" ? `No members in "${active}".` : "Members will appear once added."}</p>
              {active !== "all" && (
                <button className="tm-abtn reset" onClick={() => setActive("all")}>View All</button>
              )}
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection animation="fadeInUp">
          <div className="tm-cta">
            <h3 className="tm-cta-h">Ready to Start Your Adventure?</h3>
            <p className="tm-cta-p">Connect with our team to plan your transformative East African journey.</p>
            <div className="tm-cta-row">
              <Button to="/contact" variant="primary" icon={<FiArrowRight size={15} />}>Contact Our Team</Button>
              <Button to="/destinations" variant="outline">Explore Destinations</Button>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
};

export default TeamContent;