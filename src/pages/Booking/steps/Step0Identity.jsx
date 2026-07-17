import React from "react";
import { HiUser, HiFlag } from "react-icons/hi";
import { InputField } from "../components/FormComponents";

export default function Step0Identity({ data, set, touch, errors, touched, firstInputRef }) {
  return (
    <div className="space-y-4">
      <InputField
        id="firstName" label="First Name" icon={HiUser}
        refProp={firstInputRef}
        value={data.firstName}
        onChange={(v) => set("firstName", v)}
        onBlur={() => touch("firstName")}
        placeholder="Sarah" autoComplete="given-name" required
        error={touched.firstName && errors.firstName}
        valid={touched.firstName && !errors.firstName && data.firstName.trim().length >= 2}
      />
      <InputField
        id="lastName" label="Last Name" icon={HiUser}
        value={data.lastName}
        onChange={(v) => set("lastName", v)}
        onBlur={() => touch("lastName")}
        placeholder="Johnson" autoComplete="family-name" required
        error={touched.lastName && errors.lastName}
        valid={touched.lastName && !errors.lastName && data.lastName.trim().length >= 2}
      />
      <InputField
        id="nationality" label="Nationality" icon={HiFlag}
        value={data.nationality}
        onChange={(v) => set("nationality", v)}
        onBlur={() => touch("nationality")}
        placeholder="American, British, Rwandan..." required
        hint="Helps us tailor visa & permit advice"
        error={touched.nationality && errors.nationality}
        valid={touched.nationality && !errors.nationality && data.nationality.trim().length >= 2}
      />
    </div>
  );
}