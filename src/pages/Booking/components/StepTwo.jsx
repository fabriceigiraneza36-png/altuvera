// src/pages/Booking/components/StepTwo.jsx
import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Home, Baby, PersonStanding, CheckCircle2 } from "lucide-react";
import { THEME } from "../BookingShared";

/* ── Counter ── */
const Counter = ({ label, hint, icon, value, onChange, min = 0, max = 30 }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "16px 0",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        border: "1.5px solid #a7f3d0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, color: "#1f2937" }}>{label}</p>
        {hint && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{hint}</p>}
      </div>
    </div>
    <div style={{
      display: "flex", alignItems: "center",
      background: "#fff", borderRadius: 14,
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      overflow: "hidden",
    }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        style={{
          width: 40, height: 40, border: "none",
          background: value <= min ? "#f9fafb" : "#fff",
          color: value <= min ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700,
          cursor: value <= min ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >−</button>
      <span style={{
        minWidth: 44, textAlign: "center",
        fontSize: 17, fontWeight: 800, color: "#111827",
        borderLeft: "1px solid #f3f4f6",
        borderRight: "1px solid #f3f4f6",
        lineHeight: "40px", height: 40,
      }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        style={{
          width: 40, height: 40, border: "none",
          background: value >= max ? "#f9fafb" : "#fff",
          color: value >= max ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700,
          cursor: value >= max ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >+</button>
    </div>
  </div>
);

/* ── Section header ── */
const CardHeader = ({ icon, label }) => (
  <div style={{
    padding: "13px 22px", borderBottom: "1px solid #f3f4f6",
    background: "linear-gradient(to right,#f0fdf4,#fff)",
    display: "flex", alignItems: "center", gap: 8,
  }}>
    {React.cloneElement(icon, { size: 15, color: "#059669" })}
    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: ".06em" }}>
      {label}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   STEP TWO
══════════════════════════════════════════════════════════════ */
const StepTwo = memo(({
  formData, setFormData, errors, touched,
  groupTypes, accommodationTypes, getTotalVisitors, isMobile, displayName,
}) => {
  const adults   = parseInt(formData.adults,   10) || 0;
  const children = parseInt(formData.children, 10) || 0;
  const infants  = parseInt(formData.infants,  10) || 0;
  const total    = adults + children + infants;

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
          <Users size={30} color="#fff" />
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
            Perfect, {displayName}!
          </motion.span>
        )}

        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: isMobile ? 26 : 34, fontWeight: 900,
          color: "#0f172a", margin: "0 0 10px",
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          Who's joining the{" "}
          <span style={{ color: "#059669" }}>adventure?</span>
        </h2>
        <p style={{
          fontSize: isMobile ? 14 : 15.5, color: "#6b7280",
          lineHeight: 1.65, maxWidth: 500, margin: "0 auto",
        }}>
          Tell us about your group so we can tailor the perfect experience.
        </p>
      </div>

      {/* ── Group type ── */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.06)",
        marginBottom: 20, overflow: "hidden",
      }}>
        <CardHeader icon={<Users />} label="Group Type" />
        <div style={{
          padding: "18px 22px",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
          gap: 12,
        }}>
          {(groupTypes || []).map((g, i) => {
            const isActive = formData.groupType === (g.value || g.id);
            return (
              <motion.button
                key={g.value || g.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.15)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData((p) => ({ ...p, groupType: g.value || g.id }))}
                role="radio"
                aria-checked={isActive}
                style={{
                  padding: "18px 10px", borderRadius: 16,
                  background: isActive
                    ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                    : "#f9fafb",
                  border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                  cursor: "pointer", textAlign: "center",
                  transition: "all .2s", fontFamily: "inherit",
                  boxShadow: isActive ? "0 4px 16px rgba(5,150,105,.18)" : "none",
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}>{g.icon}</div>
                <div style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: isActive ? "#065f46" : "#374151",
                  lineHeight: 1.3,
                }}>
                  {g.label || g.name || g.full_name}
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#059669", margin: "8px auto 0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <CheckCircle2 size={13} color="#fff" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        {errors.groupType && touched.groupType && (
          <p style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
            ⚠ {errors.groupType}
          </p>
        )}
      </div>

      {/* ── Traveler counts ── */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.06)",
        marginBottom: 20, overflow: "hidden",
      }}>
        <CardHeader icon={<Users />} label="Number of Travellers" />
        <div style={{ padding: "4px 22px" }}>
          <Counter
            icon="🧑" label="Adults" hint="Ages 18 and above"
            value={adults} min={1} max={30}
            onChange={(v) => setFormData((p) => ({ ...p, adults: v }))}
          />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <Counter
            icon="🧒" label="Children" hint="Ages 5 – 17"
            value={children} min={0} max={15}
            onChange={(v) => setFormData((p) => ({ ...p, children: v }))}
          />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <Counter
            icon="👶" label="Infants" hint="Ages 0 – 4"
            value={infants} min={0} max={5}
            onChange={(v) => setFormData((p) => ({ ...p, infants: v }))}
          />
        </div>

        {/* Total badge */}
        <AnimatePresence>
          {total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                margin: "0 22px 18px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "1.5px solid #a7f3d0",
                borderRadius: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={18} color="#059669" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46" }}>
                  Total travellers
                </span>
              </div>
              <motion.span
                key={total}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  fontSize: 30, fontWeight: 900, color: "#059669",
                  lineHeight: 1,
                }}
              >
                {total}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.adults && touched.adults && (
          <p style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
            ⚠ {errors.adults}
          </p>
        )}
      </div>

      {/* ── Accommodation ── */}
      {accommodationTypes?.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 20,
          border: "1.5px solid #f0fdf4",
          boxShadow: "0 2px 16px rgba(5,150,105,.06)",
          overflow: "hidden",
        }}>
          <CardHeader icon={<Home />} label="Accommodation Style" />
          <div style={{
            padding: "18px 22px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 12,
          }}>
            {accommodationTypes.map((a, i) => {
              const id = a.value || a.id;
              const isActive = formData.accommodationType === id || formData.accommodation === id;
              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.15)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData((p) => ({
                    ...p, accommodationType: id, accommodation: id,
                  }))}
                  role="radio"
                  aria-checked={isActive}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 16,
                    background: isActive
                      ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                      : "#f9fafb",
                    border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all .2s", fontFamily: "inherit",
                    boxShadow: isActive ? "0 4px 16px rgba(5,150,105,.18)" : "none",
                    display: "flex", alignItems: "flex-start", gap: 14,
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: isActive
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, transition: "all .2s",
                    boxShadow: isActive ? "0 4px 12px rgba(5,150,105,.3)" : "none",
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: "0 0 3px", fontWeight: 700, fontSize: 14,
                      color: isActive ? "#065f46" : "#111827",
                    }}>
                      {a.label || a.name}
                    </p>
                    {(a.desc || a.description) && (
                      <p style={{
                        margin: 0, fontSize: 12, color: "#9ca3af",
                        lineHeight: 1.5,
                      }}>
                        {a.desc || a.description}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  )}
                </motion.button>
              );
            })}
          </div>
          {errors.accommodationType && touched.accommodationType && (
            <p style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
              ⚠ {errors.accommodationType}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

StepTwo.displayName = "StepTwo";
export default StepTwo;