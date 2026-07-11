// src/pages/Booking/components/StepFour.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Globe, Settings, Clock,
  MapPin, Compass, MessageCircle, CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { THEME } from "../BookingShared";

/* ── Shared field primitives ── */
const Label = ({ children, required }) => (
  <p style={{
    margin: "0 0 8px", fontSize: 12.5, fontWeight: 700,
    color: "#374151", textTransform: "uppercase", letterSpacing: ".07em",
    display: "flex", alignItems: "center", gap: 4,
  }}>
    {children}
    {required && <span style={{ color: "#ef4444", fontSize: 14 }}>*</span>}
  </p>
);

const FieldError = ({ error, touched }) =>
  error && touched ? (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "6px 0 0", fontSize: 12.5, color: "#dc2626",
        fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
      }}
      role="alert"
    >
      ⚠ {error}
    </motion.p>
  ) : null;

const TextInput = ({
  name, label, type = "text", placeholder, required,
  icon: Icon, value, onChange, onBlur, error, touched, helpText,
}) => {
  const hasVal = !!value;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
          width: 34, height: 34, borderRadius: 10,
          background: hasVal
            ? "linear-gradient(135deg,#059669,#10b981)"
            : "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <Icon size={15} color={hasVal ? "#fff" : "#9ca3af"} />
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          style={{
            width: "100%", padding: "14px 16px 14px 60px",
            background: hasVal ? "#f0fdf4" : "#f9fafb",
            border: `2px solid ${
              error && touched ? "#fca5a5"
              : hasVal ? "#6ee7b7"
              : "#e5e7eb"
            }`,
            borderRadius: 14, fontSize: 14.5, fontWeight: hasVal ? 600 : 400,
            color: "#111827", outline: "none",
            boxSizing: "border-box", fontFamily: "inherit",
            transition: "all .2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669";
            e.target.style.background  = "#f0fdf4";
            e.target.style.boxShadow   = "0 0 0 4px rgba(5,150,105,.1)";
          }}
          onBlur={(e) => {
            onBlur?.(e);
            e.target.style.borderColor = hasVal ? "#6ee7b7" : (error && touched ? "#fca5a5" : "#e5e7eb");
            e.target.style.background  = hasVal ? "#f0fdf4" : "#f9fafb";
            e.target.style.boxShadow   = "none";
          }}
        />
      </div>
      <FieldError error={error} touched={touched} />
      {helpText && (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9ca3af" }}>{helpText}</p>
      )}
    </div>
  );
};

const SelectInput = ({
  name, label, options, icon: Icon, value, onChange, onBlur,
  error, touched, required,
}) => {
  const hasVal = !!value;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
          width: 34, height: 34, borderRadius: 10,
          background: hasVal
            ? "linear-gradient(135deg,#059669,#10b981)"
            : "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <Icon size={15} color={hasVal ? "#fff" : "#9ca3af"} />
        </div>
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          style={{
            width: "100%", padding: "14px 40px 14px 60px",
            background: hasVal ? "#f0fdf4" : "#f9fafb",
            border: `2px solid ${
              error && touched ? "#fca5a5"
              : hasVal ? "#6ee7b7"
              : "#e5e7eb"
            }`,
            borderRadius: 14, fontSize: 14.5, fontWeight: hasVal ? 600 : 400,
            color: hasVal ? "#111827" : "#9ca3af",
            outline: "none", boxSizing: "border-box",
            fontFamily: "inherit", cursor: "pointer",
            appearance: "none", transition: "all .2s",
          }}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value ?? o.id} value={o.value ?? o.id}>{o.name ?? o.label}</option>
          ))}
        </select>
        <ChevronDown
          size={16} color="#9ca3af"
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
      </div>
      <FieldError error={error} touched={touched} />
    </div>
  );
};

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
   STEP FOUR
══════════════════════════════════════════════════════════════ */
const StepFour = memo(({
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  user, isMobile, displayName,
  isAuthenticated, openModal,
}) => {
  const greeting = displayName
    ? `Almost there, ${displayName}!`
    : "Almost there!";

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
          <User size={30} color="#fff" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile ? 26 : 34, fontWeight: 900,
            color: "#0f172a", margin: "0 0 10px",
            letterSpacing: "-0.02em", lineHeight: 1.2,
          }}
        >
          Almost{" "}
          <span style={{ color: "#059669" }}>there!</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            fontSize: isMobile ? 14 : 15.5, color: "#6b7280",
            lineHeight: 1.65, maxWidth: 520, margin: "0 auto",
          }}
        >
          {displayName ? `Let's go, ${displayName}! ` : ""}
          Fill in your contact details and we'll be in touch within 24 hours.
        </motion.p>
      </div>

      {/* ── Auto-fill notice (authenticated) ── */}
      {isAuthenticated && (formData.firstName || formData.email) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 20,
            display: "flex", alignItems: "flex-start", gap: 14,
            padding: "18px 22px",
            background: "linear-gradient(135deg,rgba(5,150,105,.08),rgba(236,253,245,1))",
            border: "1.5px solid rgba(16,185,129,.2)",
            borderRadius: 18,
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle2 size={20} color="#fff" />
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: "#065f46" }}>
              Auto-filled from your account
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Your name and email have been pre-loaded for a smoother booking experience.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Contact details card ── */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.06)",
        marginBottom: 20, overflow: "hidden",
      }}>
        <CardHeader icon={<User />} label="Contact Details" />
        <div style={{
          padding: "20px 22px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 18 : 22,
        }}>
          <TextInput
            name="firstName" label="First Name" required
            placeholder="Jane" icon={User}
            value={formData.firstName}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.firstName} touched={touched.firstName}
          />
          <TextInput
            name="lastName" label="Last Name" required
            placeholder="Smith" icon={User}
            value={formData.lastName}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.lastName} touched={touched.lastName}
          />
          <TextInput
            name="email" label="Email Address" type="email" required
            placeholder="jane@example.com" icon={Mail}
            value={formData.email}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.email} touched={touched.email}
          />
          <TextInput
            name="phone" label="Phone Number" type="tel" required
            placeholder="+1 234 567 8900" icon={Phone}
            value={formData.phone}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.phone} touched={touched.phone}
          />
          <TextInput
            name="country" label="Your Country" required
            placeholder="United States" icon={Globe}
            value={formData.country}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.country} touched={touched.country}
          />
        </div>
      </div>

      {/* ── Travel preferences card ── */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.06)",
        marginBottom: 20, overflow: "hidden",
      }}>
        <div style={{
          padding: "13px 22px", borderBottom: "1px solid #f3f4f6",
          background: "linear-gradient(to right,#f0fdf4,#fff)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Settings size={15} color="#059669" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Travel Preferences
          </span>
          <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 400 }}>— optional</span>
        </div>
        <div style={{
          padding: "20px 22px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 18 : 22,
        }}>
          <SelectInput
            name="preferredContactMethod"
            label="Preferred Contact"
            icon={MessageCircle}
            value={formData.preferredContactMethod}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.preferredContactMethod}
            touched={touched.preferredContactMethod}
            options={[
              { value: "whatsapp", name: "💬 WhatsApp" },
              { value: "email",    name: "📧 Email"    },
              { value: "phone",    name: "📞 Phone Call" },
            ]}
          />
          <TextInput
            name="preferredContactTime"
            label="Best Time to Reach You"
            placeholder="e.g. 9am–12pm (GMT+2)"
            icon={Clock}
            value={formData.preferredContactTime}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.preferredContactTime}
            touched={touched.preferredContactTime}
            helpText="Include your timezone for faster replies."
          />
          <TextInput
            name="pickupLocation"
            label="Pickup Location"
            placeholder="Hotel / Airport / City"
            icon={MapPin}
            value={formData.pickupLocation}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.pickupLocation}
            touched={touched.pickupLocation}
          />
          <SelectInput
            name="marketingSource"
            label="How Did You Find Us?"
            icon={Compass}
            value={formData.marketingSource}
            onChange={handleChange} onBlur={handleBlur}
            error={errors.marketingSource}
            touched={touched.marketingSource}
            options={[
              { value: "google",    name: "🔍 Google Search"   },
              { value: "instagram", name: "📸 Instagram"        },
              { value: "tiktok",    name: "🎵 TikTok"           },
              { value: "facebook",  name: "👥 Facebook"         },
              { value: "referral",  name: "🤝 Friend/Referral"  },
              { value: "returning", name: "✈️ Returning Traveler" },
              { value: "other",     name: "💡 Other"            },
            ]}
          />
        </div>

        {/* Newsletter opt-in */}
        <div style={{ padding: "0 22px 18px" }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer",
          }}>
            <div
              onClick={() => setFormData((p) => ({ ...p, newsletterOptIn: !p.newsletterOptIn }))}
              style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${formData.newsletterOptIn ? "#059669" : "#d1d5db"}`,
                background: formData.newsletterOptIn
                  ? "linear-gradient(135deg,#059669,#10b981)"
                  : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all .18s",
              }}
            >
              {formData.newsletterOptIn && (
                <CheckCircle2 size={13} color="#fff" />
              )}
            </div>
            <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500 }}>
              Email me destination updates and travel inspiration
            </span>
          </label>
        </div>
      </div>

      {/* ── Special requests ── */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.06)",
        marginBottom: 20, overflow: "hidden",
      }}>
        <CardHeader icon={<MessageCircle />} label="Special Requests or Questions" />
        <div style={{ padding: "16px 22px" }}>
          <textarea
            name="specialRequests"
            value={formData.specialRequests || ""}
            onChange={handleChange}
            placeholder="Any special requirements, dietary needs, celebrations, or questions…"
            rows={4}
            style={{
              width: "100%", padding: "14px 16px",
              fontSize: 14.5, border: "2px solid #e5e7eb",
              borderRadius: 14, background: "#f9fafb",
              outline: "none", resize: "vertical",
              minHeight: isMobile ? 100 : 120,
              fontFamily: "inherit", lineHeight: 1.6,
              color: "#374151", transition: "all .2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.background  = "#f0fdf4";
              e.target.style.boxShadow   = "0 0 0 4px rgba(5,150,105,.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.background  = "#f9fafb";
              e.target.style.boxShadow   = "none";
            }}
          />
        </div>
      </div>

      {/* ── WhatsApp info ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: isMobile ? "18px" : "22px",
          background: "linear-gradient(135deg,rgba(37,211,102,.1),rgba(5,150,105,.06))",
          border: "1.5px solid rgba(37,211,102,.25)",
          borderRadius: 20,
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#25D366,#128C7E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37,211,102,.3)",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: "#065f46" }}>
            Your request will be sent via WhatsApp
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Our travel expert will respond within 24 hours with a personalised quote.
          </p>
        </div>
      </motion.div>
    </div>
  );
});

StepFour.displayName = "StepFour";
export default StepFour;