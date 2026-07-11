// src/pages/Booking/components/StepThree.jsx  — Interests step (kept as step 3 if used)
import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, CheckCircle2, MessageCircle } from "lucide-react";
import { THEME, ADMIN_CONTACT } from "../BookingShared";

const CardHeader = ({ icon, label, sub }) => (
  <div style={{
    padding: "13px 22px", borderBottom: "1px solid #f3f4f6",
    background: "linear-gradient(to right,#f0fdf4,#fff)",
    display: "flex", alignItems: "center", gap: 8,
  }}>
    {React.cloneElement(icon, { size: 15, color: "#059669" })}
    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: ".06em" }}>
      {label}
    </span>
    {sub && <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 400, marginLeft: 4, textTransform: "none" }}>{sub}</span>}
  </div>
);

const StepThree = memo(({ formData, interests, handleInterestToggle, isMobile, displayName }) => {
  const selectedCount = (formData.interests || []).length;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 12px 36px rgba(5,150,105,.32)",
          }}
        >
          <Heart size={30} color="#fff" />
        </motion.div>

        {displayName && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "inline-block", marginBottom: 10,
              background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
              border: "1.5px solid #a7f3d0", borderRadius: 20,
              padding: "4px 16px", fontSize: 12, fontWeight: 700,
              color: "#059669", letterSpacing: ".05em", textTransform: "uppercase",
            }}
          >
            Excellent, {displayName}!
          </motion.span>
        )}

        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: isMobile ? 26 : 34, fontWeight: 900,
          color: "#0f172a", margin: "0 0 10px",
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          What excites you{" "}
          <span style={{ color: "#059669" }}>most?</span>
        </h2>
        <p style={{
          fontSize: isMobile ? 14 : 15.5, color: "#6b7280",
          lineHeight: 1.65, maxWidth: 500, margin: "0 auto",
        }}>
          Select the experiences that excite you most and we'll build a
          custom itinerary around your passions.
        </p>
      </div>

      {/* ── Interests grid ── */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.06)",
        marginBottom: 20, overflow: "hidden",
      }}>
        <CardHeader
          icon={<Star />}
          label="Select Your Interests"
          sub="· choose as many as you like"
        />
        <div style={{ padding: "18px 22px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 10,
          }}>
            {(interests || []).map((item, i) => {
              const val   = item?.value ?? item?.name ?? item;
              const label = item?.label ?? item?.name ?? item;
              const icon  = item?.icon ?? "";
              const active = (formData.interests || []).includes(val);

              return (
                <motion.button
                  key={val}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.15)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleInterestToggle(val)}
                  aria-pressed={active}
                  style={{
                    padding: "14px 10px",
                    borderRadius: 14, border: "none",
                    background: active
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : "#f3f4f6",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all .18s",
                    boxShadow: active ? "0 4px 14px rgba(5,150,105,.28)" : "none",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 6,
                  }}
                >
                  {icon && (
                    <span style={{ fontSize: 26 }} aria-hidden="true">{icon}</span>
                  )}
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: active ? "#fff" : "#374151",
                    lineHeight: 1.3, textAlign: "center",
                  }}>
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 8, height: 0 }}
                style={{ marginTop: 16 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px",
                  background: selectedCount >= 3
                    ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                    : "#f9fafb",
                  border: `1.5px solid ${selectedCount >= 3 ? "#a7f3d0" : "#e5e7eb"}`,
                  borderRadius: 14,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: selectedCount >= 3
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .25s",
                  }}>
                    <CheckCircle2 size={18} color={selectedCount >= 3 ? "#fff" : "#9ca3af"} />
                  </div>
                  <div>
                    <p style={{
                      margin: 0, fontWeight: 700, fontSize: 14,
                      color: selectedCount >= 3 ? "#065f46" : "#374151",
                    }}>
                      {selectedCount < 3
                        ? `${selectedCount} selected — add a few more!`
                        : `${selectedCount} interest${selectedCount !== 1 ? "s" : ""} selected ✨`}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
                      {selectedCount >= 3
                        ? "We'll build a tailored itinerary around these."
                        : "The more you select, the better we can customise your trip."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Info banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          display: "flex", alignItems: "flex-start", gap: 16,
          padding: isMobile ? "18px" : "22px",
          background: "linear-gradient(135deg,rgba(37,211,102,.08),rgba(5,150,105,.05))",
          border: "1.5px solid rgba(37,211,102,.22)",
          borderRadius: 20,
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg,#25D366,#128C7E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37,211,102,.3)",
        }}>
          <MessageCircle size={22} color="#fff" />
        </div>
        <div>
          <p style={{
            margin: "0 0 5px", fontWeight: 800, fontSize: 14.5, color: "#065f46",
          }}>
            Personalised Pricing
          </p>
          <p style={{ margin: 0, fontSize: 13.5, color: "#6b7280", lineHeight: 1.6 }}>
            After you submit,{" "}
            <strong style={{ color: "#059669" }}>
              {ADMIN_CONTACT?.name ?? "our travel expert"}
            </strong>{" "}
            will contact you via WhatsApp with a custom quote built around your interests.
          </p>
        </div>
      </motion.div>
    </div>
  );
});

StepThree.displayName = "StepThree";
export default StepThree;