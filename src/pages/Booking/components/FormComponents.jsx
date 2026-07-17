import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  HiCheckCircle, HiExclamationCircle, HiInformationCircle,
  HiChevronRight, HiMail,
} from "react-icons/hi";

/* Spinner */
export const Spinner = ({ className = "" }) => (
  <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
);

/* ── Input field ── */
export const InputField = ({
  id, label, icon: Icon, type = "text",
  value, onChange, onBlur, placeholder,
  error, valid, required, autoComplete,
  hint, refProp, ...props
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label}
      {!required && <span className="text-gray-400 font-normal text-xs ml-1">— Optional</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Icon className={`w-[18px] h-[18px] transition-colors duration-200
          ${error ? "text-red-400" : valid ? "text-emerald-500" : "text-gray-400"}`} />
      </div>
      <input
        id={id} ref={refProp} type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`w-full h-12 pl-11 pr-10 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm
          placeholder:text-gray-400 outline-none transition-all duration-200
          ${error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : valid
              ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"}`}
        {...props}
      />
      {valid && (
        <HiCheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
      )}
    </div>
    {hint && !error && (
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />{hint}
      </p>
    )}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

/* ── Email field with live suggestions ── */
const EMAIL_DOMAINS = [
  "gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com",
  "aol.com","live.com","protonmail.com","me.com","msn.com","ymail.com",
];

export const EmailField = ({
  id = "email", label = "Email Address",
  value, onChange, onBlur, error, valid, required, hint,
}) => {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  const suggestions = useMemo(() => {
    const v = value.trim();
    if (!v || !focused) return [];
    const atIdx = v.indexOf("@");
    if (atIdx === -1) return EMAIL_DOMAINS.slice(0, 5).map(d => `${v}@${d}`);
    const local = v.slice(0, atIdx);
    const domain = v.slice(atIdx + 1).toLowerCase();
    if (!local) return [];
    if (!domain) return EMAIL_DOMAINS.slice(0, 5).map(d => `${local}@${d}`);
    return EMAIL_DOMAINS
      .filter(d => d.startsWith(domain) && d !== domain)
      .slice(0, 5)
      .map(d => `${local}@${d}`);
  }, [value, focused]);

  useEffect(() => setHighlight(0), [value]);

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pick = (s) => { onChange(s); setFocused(false); };

  const handleKey = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => (h + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => (h - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && suggestions[highlight]) { e.preventDefault(); pick(suggestions[highlight]); }
    else if (e.key === "Escape") setFocused(false);
  };

  return (
    <div ref={wrapRef} className="relative space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
        {!required && <span className="text-gray-400 font-normal text-xs ml-1">— Optional</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <HiMail className={`w-[18px] h-[18px] transition-colors duration-200
            ${error ? "text-red-400" : valid ? "text-emerald-500" : "text-gray-400"}`} />
        </div>
        <input
          id={id} type="email" autoComplete="email" required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={onBlur}
          onKeyDown={handleKey}
          placeholder="you@example.com"
          className={`w-full h-12 pl-11 pr-10 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm
            placeholder:text-gray-400 outline-none transition-all duration-200
            ${error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              : valid
                ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"}`}
          aria-autocomplete="list"
        />
        {valid && (
          <HiCheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
        )}
      </div>

      {focused && suggestions.length > 0 && (
        <ul className="absolute z-40 top-full left-0 right-0 mt-1 bg-white rounded-xl
                       border-2 border-emerald-100 shadow-2xl shadow-emerald-900/10 overflow-hidden"
            role="listbox">
          <li className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest
                         text-emerald-700 bg-emerald-50 border-b border-emerald-100">
            Suggestions
          </li>
          {suggestions.map((s, i) => (
            <li key={s}>
              <button type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5
                  ${i === highlight ? "bg-emerald-50 text-emerald-900" : "text-gray-700 hover:bg-gray-50"}`}>
                <HiMail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hint && !error && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />{hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
};

/* ── Native select ── */
export const SelectField = ({
  id, label, icon: Icon, value, onChange, onBlur,
  children, required, error, valid, hint, refProp,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label}
      {!required && <span className="text-gray-400 font-normal text-xs ml-1">— Optional</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Icon className={`w-[18px] h-[18px] transition-colors duration-200
          ${error ? "text-red-400" : valid ? "text-emerald-500" : "text-gray-400"}`} />
      </div>
      <select
        id={id} ref={refProp} value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur} required={required}
        className={`w-full h-12 pl-11 pr-9 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm
          outline-none appearance-none cursor-pointer transition-all duration-200
          ${error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : valid
              ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"}`}>
        {children}
      </select>
      <HiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
    </div>
    {hint && !error && (
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />{hint}
      </p>
    )}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

/* ── Textarea ── */
export const TextareaField = ({
  id, label, value, onChange, placeholder, maxLength = 500, hint,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label}
      <span className="text-gray-400 font-normal text-xs ml-1">— Optional</span>
    </label>
    <textarea
      id={id} rows={3} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm
                 p-3.5 placeholder:text-gray-400 outline-none focus:border-emerald-500
                 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 resize-none transition-all"
    />
    <div className="flex items-center justify-between">
      {hint ? (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <HiInformationCircle className="w-3.5 h-3.5" />{hint}
        </p>
      ) : <span/>}
      <span className={`text-xs tabular-nums ${
        value.length > maxLength * 0.85
          ? value.length >= maxLength ? "text-red-500 font-semibold" : "text-amber-500"
          : "text-gray-400"
      }`}>{value.length}/{maxLength}</span>
    </div>
  </div>
);