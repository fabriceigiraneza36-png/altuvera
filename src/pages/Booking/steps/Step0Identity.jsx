// src/pages/Booking/steps/Step0Identity.jsx
import React from "react";
import { HiUser, HiFlag, HiCheck, HiExclamationCircle } from "react-icons/hi";

function Field({ id, label, icon: Icon, value, onChange, onBlur, placeholder,
  autoComplete, required, error, valid, hint, refProp, type = "text" }) {
  return (
    <div className="bk-field-group">
      <label htmlFor={id} className="bk-label">
        {label}
        {required && <span className="bk-label-req">*</span>}
      </label>
      <div className="bk-input-wrap">
        <span className="bk-input-ico"><Icon size={17} /></span>
        <input
          ref={refProp}
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

export default function Step0Identity({ data, set, touch, errors, touched, firstInputRef }) {
  return (
    <div>
      <div className="bk-field-row">
        <Field
          id="firstName" label="First Name" icon={HiUser}
          refProp={firstInputRef}
          value={data.firstName}
          onChange={v => set("firstName", v)}
          onBlur={() => touch("firstName")}
          placeholder="Sarah" autoComplete="given-name" required
          error={touched.firstName && errors.firstName}
          valid={touched.firstName && !errors.firstName && data.firstName.trim().length >= 2}
        />
        <Field
          id="lastName" label="Last Name" icon={HiUser}
          value={data.lastName}
          onChange={v => set("lastName", v)}
          onBlur={() => touch("lastName")}
          placeholder="Johnson" autoComplete="family-name" required
          error={touched.lastName && errors.lastName}
          valid={touched.lastName && !errors.lastName && data.lastName.trim().length >= 2}
        />
      </div>
      <Field
        id="nationality" label="Nationality" icon={HiFlag}
        value={data.nationality}
        onChange={v => set("nationality", v)}
        onBlur={() => touch("nationality")}
        placeholder="American, British, Rwandan..." required
        hint="Helps us tailor visa & permit advice"
        error={touched.nationality && errors.nationality}
        valid={touched.nationality && !errors.nationality && data.nationality.trim().length >= 2}
      />
    </div>
  );
}