import React, { forwardRef, useCallback, useMemo, useRef, useId } from "react";

const DEFAULT_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
];

const getSuggestions = (value, domains, limit = 6) => {
  const v = typeof value === "string" ? value : "";
  const at = v.indexOf("@");
  if (at < 0) return [];

  const local = v.slice(0, at);
  const domainPart = v.slice(at + 1);
  if (!local) return [];

  const typedDomain = domainPart.toLowerCase();
  const matches =
    typedDomain.length === 0
      ? domains
      : domains.filter((d) => d.startsWith(typedDomain));

  return matches.slice(0, limit).map((d) => `${local}@${d}`);
};

const mergeRefs = (a, b) => (node) => {
  if (typeof a === "function") a(node);
  else if (a) a.current = node;
  if (typeof b === "function") b(node);
  else if (b) b.current = node;
};

export default forwardRef(function EmailAutocompleteInput(
  {
    value,
    onValueChange,
    domains = DEFAULT_DOMAINS,
    name,
    autoComplete = "email",
    inputMode = "email",
    ...props
  },
  ref,
) {
  const innerRef = useRef(null);
  const datalistId = useId();

  const normalizedDomains = useMemo(() => {
    const list = Array.isArray(domains) ? domains : DEFAULT_DOMAINS;
    return list
      .map((d) =>
        String(d || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
  }, [domains]);

  const suggestions = useMemo(
    () => getSuggestions(value, normalizedDomains),
    [normalizedDomains, value],
  );

  const handleChange = useCallback(
    (e) => {
      onValueChange?.(e.target.value);
    },
    [onValueChange],
  );

  return (
    <>
      <input
        {...props}
        ref={mergeRefs(ref, innerRef)}
        name={name}
        type="email"
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={handleChange}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
      />
      {suggestions.length > 0 && (
        <datalist id={datalistId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </>
  );
});
