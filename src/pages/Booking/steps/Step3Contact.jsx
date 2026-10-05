import React, { useMemo, useState } from "react";
import {
  Mail, Phone, Home, Check, AlertCircle, MessageSquareText, Smartphone, ChevronDown,
} from "lucide-react";
import { COUNTRY_PHONE_CODES } from "../../../data/countryPhoneCodes";

const METHODS = [
  { v: "whatsapp", l: "WhatsApp", icon: MessageSquareText },
  { v: "email", l: "Email", icon: Mail },
  { v: "phone", l: "Phone", icon: Smartphone },
];

function Field({ id, label, icon: Icon, value, onChange, onBlur, placeholder, autoComplete, required, error, valid, hint, type = "text" }) {
  return (
    <div className="bk-field-group">
      <label htmlFor={id} className="bk-label">{label}{required && <span className="bk-label-req">*</span>}</label>
      <div className="bk-input-wrap">
        <span className="bk-input-ico"><Icon size={17} /></span>
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`bk-input${error ? " bk-input--err" : ""}${valid ? " bk-input--valid" : ""}`} />
        {valid && <span className="bk-check-ico"><Check size={18} /></span>}
      </div>
      {error && <p className="bk-field-err"><AlertCircle size={13} /> {error}</p>}
      {hint && !error && <p className="bk-hint">{hint}</p>}
    </div>
  );
}

function CountrySuggestions({ value, onSelect }) {
  const q = value.trim().toLowerCase();
  if (!q) return null;
  const matches = COUNTRY_PHONE_CODES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 7);
  if (!matches.length) return null;
  return (
    <div className="bk-country-suggest" role="listbox">
      {matches.map((c) => (
        <button key={c.code} type="button" className="bk-country-suggest__item"
          onMouseDown={(e) => e.preventDefault()} onClick={() => onSelect(c)}>
          <span>{c.name}</span><strong>{c.dialCode}</strong>
        </button>
      ))}
    </div>
  );
}

function PhoneField({ data, set, touch, errors, touched }) {
  const [countryOpen, setCountryOpen] = useState(false);
  const selected = COUNTRY_PHONE_CODES.find((c) => c.dialCode === data.phoneCountryCode)
    || COUNTRY_PHONE_CODES.find((c) => c.code === "RW");
  const query = data.phoneCountryQuery || "";
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRY_PHONE_CODES.filter((c) => !q || c.name.toLowerCase().includes(q) || c.dialCode.includes(q)).slice(0, 8);
  }, [query]);

  const prefix = selected?.dialCode || "+250";
  const storedPhone = String(data.phone || "");
  const displayPhone = storedPhone.startsWith(prefix) ? storedPhone.slice(prefix.length).trim() : storedPhone;

  const choose = (country) => {
    set("phoneCountryCode", country.dialCode);
    set("phoneCountryQuery", country.name);
    setCountryOpen(false);
    const digits = displayPhone.replace(/[^0-9]/g, "");
    set("phone", digits ? `${country.dialCode} ${digits}` : "");
    touch("phone");
  };

  const changeNumber = (value) => {
    const clean = value.replace(/[^0-9\\s().-]/g, "").trim();
    set("phone", clean ? `${prefix} ${clean}` : "");
  };

  return (
    <div className="bk-field-group">
      <label htmlFor="phone-number" className="bk-label">Phone / WhatsApp <span className="bk-label-req">*</span></label>
      <div className={`bk-phone-row${touched.phone && errors.phone ? " bk-phone-row--err" : ""}`}>
        <div className="bk-phone-country">
          <button type="button" className="bk-phone-country__button" onClick={() => setCountryOpen((v) => !v)}
            aria-expanded={countryOpen} aria-label="Choose phone country">
            <span>{selected?.code || "RW"}</span><strong>{prefix}</strong><ChevronDown size={14} />
          </button>
          {countryOpen && (
            <div className="bk-phone-country__menu">
              <input autoFocus value={query} onChange={(e) => set("phoneCountryQuery", e.target.value)}
                placeholder="Search country or code..." className="bk-phone-country__search" />
              <div className="bk-phone-country__list">
                {matches.map((c) => (
                  <button key={c.code} type="button" onClick={() => choose(c)} className="bk-phone-country__option">
                    <span>{c.name}</span><strong>{c.dialCode}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <input id="phone-number" type="tel" inputMode="tel" autoComplete="tel-national" value={displayPhone}
          onChange={(e) => changeNumber(e.target.value)} onBlur={() => touch("phone")}
          placeholder="78 123 4567" className={`bk-input bk-phone-number${touched.phone && errors.phone ? " bk-input--err" : ""}`} />
        {touched.phone && !errors.phone && displayPhone.replace(/\\D/g, "").length > 5 && <span className="bk-check-ico"><Check size={18} /></span>}
      </div>
      <p className="bk-hint">Select your country code, then enter your local phone number.</p>
      {touched.phone && errors.phone && <p className="bk-field-err"><AlertCircle size={13} /> {errors.phone}</p>}
    </div>
  );
}

export default function Step3Contact({ data, set, touch, errors, touched }) {
  const country = COUNTRY_PHONE_CODES.find((c) => c.name.toLowerCase() === data.country.trim().toLowerCase());
  const selectResidence = (c) => {
    set("country", c.name);
    set("phoneCountryCode", c.dialCode);
    set("phoneCountryQuery", c.name);
    const currentDigits = String(data.phone || "").replace(/^\\+?[0-9\\s().-]+/, "").replace(/\\D/g, "");
    set("phone", currentDigits ? `${c.dialCode} ${currentDigits}` : "");
    touch("country");
  };

  return (
    <div>
      <Field id="email" label="Email Address" icon={Mail} type="email" value={data.email}
        onChange={(v) => set("email", v)} onBlur={() => touch("email")} placeholder="you@example.com"
        autoComplete="email" required error={touched.email && errors.email}
        valid={touched.email && !errors.email && !!data.email} hint="For your booking confirmation" />

      <PhoneField data={data} set={set} touch={touch} errors={errors} touched={touched} />

      <div className="bk-field-group" style={{ position: "relative" }}>
        <Field id="country" label="Country of Residence" icon={Home} autoComplete="country-name" required
          value={data.country} onChange={(v) => set("country", v)} onBlur={() => touch("country")}
          placeholder="Start typing your country..." error={touched.country && errors.country}
          valid={touched.country && !errors.country && !!country} />
        <CountrySuggestions value={data.country} onSelect={selectResidence} />
      </div>

      <div className="bk-field-group" style={{ position: "relative" }}>
        <Field id="nationality" label="Nationality" icon={Home} autoComplete="country-name" required
          value={data.nationality} onChange={(v) => set("nationality", v)}
          onBlur={() => touch("nationality")} placeholder="Start typing your nationality..."
          error={touched.nationality && errors.nationality}
          valid={touched.nationality && !errors.nationality && data.nationality.trim().length >= 2} />
        <CountrySuggestions value={data.nationality} onSelect={(c) => { set("nationality", c.name); touch("nationality"); }} />
      </div>

      <div className="bk-field-group">
        <label className="bk-label">Preferred Contact Method <span className="bk-label-req">*</span></label>
        <p className="bk-hint">Choose how our travel team should contact you for questions, availability and planning.</p>
        <div className="bk-chip-grid">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = data.preferredContactMethod === m.v;
            return <button key={m.v} type="button" onClick={() => set("preferredContactMethod", m.v)}
              className={`bk-chip${active ? " bk-chip--active" : ""}`} style={{ flex: 1, justifyContent: "center" }}>
              <Icon size={14} />{m.l}{active && <span className="bk-chip__check"><Check size={11} /></span>}
            </button>;
          })}
        </div>
        {touched.preferredContactMethod && errors.preferredContactMethod && (
          <p className="bk-field-err"><AlertCircle size={13} /> {errors.preferredContactMethod}</p>
        )}
      </div>

      <fieldset className="bk-consent-group">
        <legend className="sr-only">Communication and consent preferences</legend>

        <label className={`bk-check-row${data.newsletterOptIn ? " bk-check-row--on" : ""}`}>
          <input
            type="checkbox"
            className="bk-checkbox"
            checked={Boolean(data.newsletterOptIn)}
            onChange={(e) => set("newsletterOptIn", e.target.checked)}
          />
          <span className="bk-check-box" aria-hidden="true">
            {data.newsletterOptIn && <Check size={13} strokeWidth={3} />}
          </span>
          <span className="bk-check-txt">Send me safari tips and exclusive offers</span>
        </label>

        <label className={`bk-check-row bk-check-row--terms${data.agreeToTerms ? " bk-check-row--on" : ""}${touched.agreeToTerms && errors.agreeToTerms ? " bk-check-row--err" : ""}`}>
          <input
            type="checkbox"
            className="bk-checkbox"
            checked={Boolean(data.agreeToTerms)}
            onChange={(e) => {
              set("agreeToTerms", e.target.checked);
              touch("agreeToTerms");
            }}
            aria-invalid={Boolean(touched.agreeToTerms && errors.agreeToTerms)}
            aria-describedby={touched.agreeToTerms && errors.agreeToTerms ? "agree-to-terms-error" : undefined}
          />
          <span className="bk-check-box" aria-hidden="true">
            {data.agreeToTerms && <Check size={13} strokeWidth={3} />}
          </span>
          <span className="bk-check-txt">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
            <span className="bk-label-req">*</span>
          </span>
        </label>

        {touched.agreeToTerms && errors.agreeToTerms && (
          <p id="agree-to-terms-error" className="bk-field-err bk-consent-error">
            <AlertCircle size={13} /> {errors.agreeToTerms}
          </p>
        )}
      </fieldset>
    </div>
  );
}
