import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Compass, MapPin, Mountain, Ticket, BookOpen } from "lucide-react";

const stories = [
  { name: "Rwanda", tagline: "Land of a thousand hills", image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=85", icon: Globe },
  { name: "Kenya", tagline: "Wildlife and wide-open plains", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=85", icon: Compass },
  { name: "Uganda", tagline: "Forests, lakes and adventure", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=700&q=85", icon: MapPin },
  { name: "Tanzania", tagline: "Iconic safaris and summits", image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=85", icon: Mountain },
  { name: "Safari packages", tagline: "Find a journey made for you", image: "https://images.unsplash.com/photo-1519659528534-7fd733a832a0?auto=format&fit=crop&w=700&q=85", icon: Ticket, to: "/packages" },
  { name: "Travel stories", tagline: "Ideas for your next adventure", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=85", icon: BookOpen, to: "/posts" },
];

export default function DashboardDiscoveryCarousel() {
  return (
    <section aria-label="Explore East Africa" style={{ minWidth: 0 }}>
      <style>{".db-discovery-track{scrollbar-width:thin;scrollbar-color:#a7f3d0 transparent}.db-discovery-card:focus-visible{outline:3px solid #059669;outline-offset:3px}.db-discovery-card:hover img{transform:scale(1.06)}@media(prefers-reduced-motion:reduce){.db-discovery-card img{transition:none!important}}"}</style>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div><p style={{ margin: "0 0 5px", fontSize: ".72rem", fontWeight: 800, color: "#94a3b8", letterSpacing: ".7px", textTransform: "uppercase" }}>Your next inspiration</p><h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.18rem", fontWeight: 900 }}>Explore East Africa</h2></div>
        <Link to="/destinations" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#059669", fontSize: ".77rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>All destinations <ArrowRight size={12} /></Link>
      </div>
      <div className="db-discovery-track" style={{ display: "flex", gap: 14, overflowX: "auto", overscrollBehaviorX: "contain", scrollSnapType: "x mandatory", padding: "2px 2px 12px", WebkitOverflowScrolling: "touch" }}>
        {stories.map((story) => { const Icon = story.icon; return <Link key={story.name} to={story.to || "/destinations"} className="db-discovery-card" style={{ position: "relative", flex: "0 0 clamp(170px, 22vw, 220px)", height: 230, borderRadius: 20, overflow: "hidden", scrollSnapAlign: "start", textDecoration: "none", background: "#064e3b", boxShadow: "0 5px 18px rgba(15,23,42,.12)" }}>
          <img src={story.image} alt={story.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s ease" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(2,20,15,.02) 15%,rgba(2,20,15,.18) 42%,rgba(2,20,15,.88) 100%)" }} />
          <span style={{ position: "absolute", top: 12, left: 12, width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 12, color: "#fff", background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)", backdropFilter: "blur(8px)" }}><Icon size={17} /></span>
          <div style={{ position: "absolute", left: 15, right: 12, bottom: 15, color: "#fff" }}><div style={{ fontSize: ".98rem", fontWeight: 900, marginBottom: 4 }}>{story.name}</div><div style={{ fontSize: ".72rem", lineHeight: 1.45, color: "rgba(255,255,255,.85)" }}>{story.tagline}</div><div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: ".72rem", fontWeight: 800 }}>Discover <ArrowRight size={13} /></div></div>
        </Link>; })}
      </div>
      <p style={{ margin: "0 0 2px", color: "#94a3b8", fontSize: ".7rem" }}>Swipe sideways to discover destinations, packages and travel inspiration.</p>
    </section>
  );
}