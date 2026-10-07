import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiAward, FiGlobe, FiInstagram, FiLinkedin,
  FiMail, FiPhone, FiTwitter, FiBriefcase,
} from "react-icons/fi";

const TeamCard = ({ member }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const rawImageUrl = member?.image_url || member?.imageUrl || member?.avatar_url || member?.photo_url || member?.image || "";
  const apiOrigin = (import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com").replace(/\/+$/, "").replace(/\/api$/, "");
  const imageUrl = rawImageUrl.startsWith("/uploads/") || rawImageUrl.startsWith("/storage/")
    ? apiOrigin + rawImageUrl
    : rawImageUrl;

  const expertise = Array.isArray(member?.expertise) ? member.expertise.filter(Boolean) : [];
  const languages = Array.isArray(member?.languages) ? member.languages.filter(Boolean) : [];

  const socials = useMemo(() => [
    member?.linkedin_url && { href: member.linkedin_url, icon: <FiLinkedin />, label: "LinkedIn" },
    member?.twitter_url && { href: member.twitter_url, icon: <FiTwitter />, label: "X / Twitter" },
    member?.instagram_url && { href: member.instagram_url, icon: <FiInstagram />, label: "Instagram" },
    member?.email && { href: `mailto:${member.email}`, icon: <FiMail />, label: "Email" },
  ].filter(Boolean), [member]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -8 }}
      style={{
        position: "relative", height: "100%", overflow: "hidden",
        borderRadius: 28, background: "#fff",
        border: "1px solid rgba(5,150,105,.14)",
        boxShadow: "0 18px 55px rgba(2,44,34,.10)",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{
        position: "relative", height: 330, minHeight: 300, overflow: "hidden",
        background: "linear-gradient(145deg,#064e3b,#059669)",
      }}>
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={member?.name ? `${member.name} — ${member.role || "Altuvera Safaris team member"}` : "Altuvera Safaris team member"}
            loading="lazy"
            onError={() => setImageFailed(true)}
            style={{
              width:"100%", height:"100%", objectFit:"cover", display:"block",
              transition:"transform .6s ease",
            }}
          />
        ) : (
          <div style={{
            width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
            color:"rgba(255,255,255,.92)", padding:28, textAlign:"center",
            background:"radial-gradient(circle at 50% 30%,rgba(255,255,255,.18),transparent 35%),linear-gradient(145deg,#022c22,#047857)",
          }}>
            <div>
              <FiGlobe size={48} style={{ opacity:.75, marginBottom:12 }} />
              <div style={{ fontWeight:800, fontSize:13, letterSpacing:".12em", textTransform:"uppercase" }}>
                Altuvera Safaris
              </div>
              <div style={{ opacity:.75, fontSize:12, marginTop:6 }}>Team portrait coming soon</div>
            </div>
          </div>
        )}

        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(180deg,rgba(2,44,34,0) 35%,rgba(2,44,34,.82) 100%)",
          pointerEvents:"none",
        }} />

        {member?.is_featured && (
          <span style={{
            position:"absolute", top:16, left:16, display:"inline-flex", alignItems:"center", gap:6,
            padding:"7px 11px", borderRadius:999, background:"rgba(255,255,255,.94)",
            color:"#065f46", fontSize:11, fontWeight:800, boxShadow:"0 8px 20px rgba(0,0,0,.12)",
          }}>
            <FiAward size={13}/> Featured specialist
          </span>
        )}

        <div style={{ position:"absolute", left:20, right:20, bottom:18, color:"#fff" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, fontSize:11, fontWeight:700, letterSpacing:".09em", textTransform:"uppercase", opacity:.9 }}>
            <FiBriefcase size={13}/> {member?.department || "Altuvera Safaris"}
          </div>
          <h3 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,2.4vw,31px)", lineHeight:1.08, fontWeight:800 }}>
            {member?.name || "Altuvera Travel Specialist"}
          </h3>
          <div style={{ marginTop:7, fontSize:14, fontWeight:700, color:"#a7f3d0" }}>
            {member?.role || "Travel Specialist"}
          </div>
        </div>
      </div>

      <div style={{ padding:"22px 22px 20px", display:"flex", flexDirection:"column", flex:1 }}>
        {member?.bio && (
          <p style={{ margin:"0 0 18px", color:"#475569", fontSize:14, lineHeight:1.72 }}>
            {member.bio}
          </p>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10, marginBottom:18 }}>
          {member?.years_experience > 0 && (
            <div style={{ padding:"11px 12px", borderRadius:14, background:"#f0fdf4", border:"1px solid #d1fae5" }}>
              <div style={{ fontSize:18, fontWeight:800, color:"#064e3b" }}>{member.years_experience}+</div>
              <div style={{ fontSize:10.5, color:"#64748b", fontWeight:700 }}>Years experience</div>
            </div>
          )}
        </div>

        {expertise.length > 0 && (
          <div style={{ marginBottom:15 }}>
            <div style={{ fontSize:10.5, fontWeight:800, color:"#064e3b", textTransform:"uppercase", letterSpacing:".09em", marginBottom:8 }}>Travel expertise</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {expertise.slice(0,5).map((item,i)=><span key={`${item}-${i}`} style={{ padding:"6px 9px", borderRadius:9, background:"#ecfdf5", color:"#047857", border:"1px solid #d1fae5", fontSize:11, fontWeight:700 }}>{item}</span>)}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:12, color:"#475569", fontSize:12 }}>
            <FiGlobe size={14} color="#059669" style={{ marginTop:2, flexShrink:0 }}/>
            <span><strong style={{ color:"#064e3b" }}>Languages:</strong> {languages.join(" • ")}</span>
          </div>
        )}

        

        <div style={{ marginTop:"auto", paddingTop:15, borderTop:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {member?.email && <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`} style={{ width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"#ecfdf5",color:"#047857",border:"1px solid #d1fae5" }}><FiMail size={15}/></a>}
            {member?.phone && <a href={`tel:${member.phone}`} aria-label={`Call ${member.name}`} style={{ width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"#ecfdf5",color:"#047857",border:"1px solid #d1fae5" }}><FiPhone size={15}/></a>}
            {socials.filter(s=>!s.label.includes("Email")).map((s,i)=><a key={i} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} style={{ width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"#ecfdf5",color:"#047857",border:"1px solid #d1fae5" }}>{s.icon}</a>)}
          </div>
          <span style={{ fontSize:10.5, color:"#64748b", fontWeight:700, textAlign:"right" }}>Here to help plan<br/>your journey</span>
        </div>
      </div>
    </motion.article>
  );
};

export default TeamCard;
