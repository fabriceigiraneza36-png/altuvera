import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DOMAINS = [
  "gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com",
  "aol.com","live.com","protonmail.com","me.com","msn.com","ymail.com",
];

export default function EmailField({
  id = "email", label = "Email Address", value, onChange, onBlur,
  error, touched, placeholder = "you@example.com", required = false,
}) {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  const err = touched && error;
  const isValid = value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const suggestions = useMemo(() => {
    const v = value.trim();
    if (!v || !focused) return [];
    const atIdx = v.indexOf("@");
    if (atIdx === -1) {
      // No @ yet — suggest common completions
      return DOMAINS.slice(0, 5).map(d => `${v}@${d}`);
    }
    const [local, domain] = [v.slice(0, atIdx), v.slice(atIdx + 1).toLowerCase()];
    if (!local) return [];
    if (!domain) return DOMAINS.slice(0, 5).map(d => `${local}@${d}`);
    // Filter by what user has typed after @
    const matches = DOMAINS
      .filter(d => d.startsWith(domain) && d !== domain)
      .slice(0, 5)
      .map(d => `${local}@${d}`);
    return matches;
  }, [value, focused]);

  useEffect(() => setHighlight(0), [value]);

  /* Click outside closes suggestions */
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pick = (s) => {
    onChange(s);
    setFocused(false);
  };

  const handleKey = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => (h + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => (h - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && suggestions[highlight]) { e.preventDefault(); pick(suggestions[highlight]); }
    else if (e.key === "Escape") setFocused(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="block text-sm lg:text-base font-semibold text-emerald-950 mb-1.5">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <input
          id={id} type="email" autoComplete="email"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { onBlur?.(e); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className={`w-full pl-12 pr-11 py-3 lg:py-4 rounded-xl border-2
            text-gray-900 placeholder-gray-300 text-sm lg:text-base font-medium
            outline-none transition-all focus:ring-4 focus:ring-emerald-900/10
            ${err
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-700"}`}
          aria-invalid={!!err}
          aria-autocomplete="list"
          aria-controls={`${id}-list`}
        />
        {isValid && !err && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </motion.span>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.ul
            id={`${id}-list`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-40 top-full left-0 right-0 mt-2
                       bg-white rounded-xl border-2 border-emerald-100
                       shadow-2xl shadow-emerald-900/10 overflow-hidden"
          >
            <li className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest
                           text-emerald-700 bg-emerald-50 border-b border-emerald-100">
              Suggestions
            </li>
            {suggestions.map((s, i) => (
              <li key={s} role="option" aria-selected={i === highlight}>
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium
                    transition-colors flex items-center gap-2.5
                    ${i === highlight
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" className="w-4 h-4 text-emerald-600 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="truncate">{s}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {err && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500 font-medium">
          {error}
        </motion.p>
      )}
    </div>
  );
}