// src/pages/Booking/components/SuccessScreen.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FiMail, FiPhone, FiMap, FiPackage,
  FiArrowRight, FiHome, FiCheckCircle,
} from "react-icons/fi";

const NEXT_STEPS = [
  { Icon: FiMail,    text: "You'll receive a confirmation email shortly" },
  { Icon: FiPhone,   text: "Our expert will contact you within 24 hours" },
  { Icon: FiMap,     text: "We'll craft your personalised itinerary" },
  { Icon: FiPackage, text: "Pack your bags — adventure awaits!" },
];

const SuccessScreen = ({ isMobile, displayName, submissionRef }) => (
  <div style={{ textAlign:"center", padding: isMobile ? "8px 0" : "20px 0" }}>

    {/* Checkmark */}
    <div style={{ position:"relative", width:90, height:90, margin:"0 auto 28px" }}>
      <div style={{
        width:90, height:90, borderRadius:"50%",
        background:"linear-gradient(135deg,#10b981,#059669)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 8px 28px rgba(16,185,129,0.35)",
        animation:"bk-scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <FiCheckCircle size={44} color="#fff" strokeWidth={1.8} />
      </div>
      {[1,2].map(i => (
        <div key={i} style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:"2px solid rgba(16,185,129,0.3)",
          animation:`bk-pulse-ring 2s ease-out ${i * 0.4}s infinite`,
        }} />
      ))}
    </div>

    <h2 style={{
      fontFamily:"'Playfair Display',Georgia,serif",
      fontSize: isMobile ? 26 : 34,
      fontWeight:800, color:"#064e3b",
      margin:"0 0 10px", letterSpacing:"-0.02em",
    }}>
      {displayName ? `Amazing, ${displayName}!` : "Booking Submitted!"}
    </h2>

    <p style={{
      fontSize:15.5, color:"#6b7280", lineHeight:1.7,
      maxWidth:460, margin:"0 auto 28px",
    }}>
      Your adventure request has been received. Our travel experts will contact
      you within{" "}
      <strong style={{ color:"#059669" }}>24 hours</strong>{" "}
      to finalise your perfect itinerary.
    </p>

    {submissionRef && (
      <div style={{
        display:"inline-flex", alignItems:"center", gap:10,
        padding:"10px 20px",
        background:"#f0fdf4", border:"1.5px solid #a7f3d0",
        borderRadius:14, marginBottom:28,
      }}>
        <span style={{ fontSize:14, color:"#6b7280" }}>Reference:</span>
        <span style={{ fontSize:15, fontWeight:800, color:"#059669", letterSpacing:"0.05em" }}>
          #{submissionRef}
        </span>
      </div>
    )}

    {/* What happens next */}
    <div style={{
      background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
      border:"1.5px solid #a7f3d0", borderRadius:20,
      padding: isMobile ? "20px 18px" : "24px 32px",
      marginBottom:28, textAlign:"left",
    }}>
      <p style={{
        fontSize:12, fontWeight:800, color:"#065f46",
        margin:"0 0 14px", textTransform:"uppercase", letterSpacing:"0.08em",
        display:"flex", alignItems:"center", gap:7,
      }}>
        <FiCheckCircle size={14} />
        What Happens Next
      </p>
      {NEXT_STEPS.map(({ Icon, text }, i) => (
        <div key={i} style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"10px 0",
          borderBottom: i < NEXT_STEPS.length - 1
            ? "1px solid rgba(16,185,129,0.12)" : "none",
        }}>
          <div style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:"rgba(16,185,129,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#059669",
          }}>
            <Icon size={16} />
          </div>
          <span style={{ fontSize:14, color:"#374151" }}>{text}</span>
        </div>
      ))}
    </div>

    {/* Actions */}
    <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
      <Link
        to="/destinations"
        className="bk-btn bk-btn--primary"
        style={{ textDecoration:"none" }}
      >
        <FiMap size={15} />
        Explore More Destinations
        <FiArrowRight size={14} />
      </Link>
      <Link
        to="/"
        className="bk-btn bk-btn--secondary"
        style={{ textDecoration:"none" }}
      >
        <FiHome size={15} />
        Back to Home
      </Link>
    </div>
  </div>
);

export default SuccessScreen;