// src/pages/Booking/steps/Step3Contact.jsx
import React from "react";
import {
  HiMail, HiPhone, HiHome, HiCheck, HiExclamationCircle,
  HiChatAlt2, HiDeviceMobile,
} from "react-icons/hi";

const METHODS = [
  { v: "whatsapp", l: "WhatsApp", icon: HiChatAlt2      },
  { v: "email",    l: "Email",    icon: HiMail          },
  { v: "phone",    l: "Phone",    icon: HiDeviceMobile  },
];

function Field({ id, label, icon: Icon, value, onChange, onBlur, placeholder,
  autoComplete, required, error, valid, hint, type = "text" }) {
  return (
    <div className="bk-field-group">
      <label htmlFor={id} className="bk-label">
        {label}
        {required && <span className="bk-label-req">*</span>}
      </label>
      <div className="bk-input-wrap">
        <span className="bk-input-ico"><Icon size={17} /></span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`bk-input${error ? " bk-input--err" : ""}${valid ? " bk-input--valid" : ""}`}
        />
        {valid && <span className="bk-check-ico"><HiCheck size={18} /></span>}
      </div>
      {error && (
        <p className="bk-field-err">
          <HiExclamationCircle size={13} /> {error}
        </p>
      )}
      {hint && !error && <p className="bk-hint">{hint}</p>}
    </div>
  );
}

export default function Step3Contact({ data, set, touch, errors, touched }) {
  return (
    <div>
      <Field
        id="email" label="Email Address" icon={HiMail} type="email"
        value={data.email}
        onChange={v => set("email", v)}
        onBlur={() => touch("email")}
        placeholder="you@example.com"
        autoComplete="email" required
        error={touched.email && errors.email}
        valid={touched.email && !errors.email && !!data.email}
        hint="For your booking confirmation"
      />
      <Field
        id="phone" label="Phone / WhatsApp" icon={HiPhone}
        type="tel" autoComplete="tel" required
        value={data.phone}
        onChange={v => set("phone", v)}
        onBlur={() => touch("phone")}
        placeholder="+1 555 123 4567"
        error={touched.phone && errors.phone}
        valid={touched.phone && !errors.phone && data.phone.length > 6}
      />
      <Field
        id="country" label="Country of Residence" icon={HiHome}
        autoComplete="country-name" required
        value={data.country}
        onChange={v => set("country", v)}
        onBlur={() => touch("country")}
        placeholder="United States"
        error={touched.country && errors.country}
        valid={touched.country && !errors.country && data.country.trim().length >= 2}
      />

      {/* Preferred contact */}
      <div className="bk-field-group">
        <label className="bk-label">Preferred Contact Method</label>
        <div className="bk-chip-grid">
          {METHODS.map(m => {
            const Icon = m.icon;
            const active = data.preferredContactMethod === m.v;
            return (
              <button key={m.v} type="button"
                onClick={() => set("preferredContactMethod", m.v)}
                className={`bk-chip${active ? " bk-chip--active" : ""}`}
                style={{ flex: 1, justifyContent: "center" }}>
                <Icon size={14} />
                {m.l}
                {active && <span className="bk-chip__check"><HiCheck size={11} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="bk-check-row"
          onClick={() => set("newsletterOptIn", !data.newsletterOptIn)}
          role="checkbox" aria-checked={data.newsletterOptIn} tabIndex={0}>
          <div className={`bk-check${data.newsletterOptIn ? " bk-check--on" : ""}`}>
            {data.newsletterOptIn && <HiCheck size={13} />}
          </div>
          <span className="bk-check-txt">Send me safari tips and exclusive offers</span>
        </div>

        <div
          className={`bk-check-row bk-check-row--terms${data.agreeToTerms ? " bk-check-row--on" : ""}${touched.agreeToTerms && errors.agreeToTerms ? " bk-check-row--err" : ""}`}
          onClick={e => {
            if (e.target.tagName === "A") return;
            set("agreeToTerms", !data.agreeToTerms);
            touch("agreeToTerms");
          }}
          role="checkbox" aria-checked={data.agreeToTerms} tabIndex={0}
        >
          <div className={`bk-check${data.agreeToTerms ? " bk-check--on" : ""}`}>
            {data.agreeToTerms && <HiCheck size={13} />}
          </div>
          <span className="bk-check-txt">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}>Privacy Policy</a>
            <span className="bk-label-req">*</span>
          </span>
        </div>
        {touched.agreeToTerms && errors.agreeToTerms && (
          <p className="bk-field-err" style={{ paddingLeft: 46 }}>
            <HiExclamationCircle size={13} /> {errors.agreeToTerms}
          </p>
        )}
      </div>
    </div>
  );
}