import React from "react";
import { motion } from "framer-motion";
import { STEPS } from "../useBookingForm";

/* SVG icons mapped to step icon keys */
const ICON = {
  wave: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 013 0m-3 6a1.5 1.5 0
           003 0m0-6V9m0-3.5a1.5 1.5 0 013 0v6m-3 0a1.5 1.5 0
           003 0m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path strokeLinecap="round"
        d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0
           01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round"
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path strokeLinecap="round"
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8
           M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0
           00-2 2v10a2 2 0 002 2z"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  checkFat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  ),
};

export default function ProgressBar({ currentStep, onStepClick, isMobile }) {
  const pct = Math.round((currentStep / (STEPS.length - 1)) * 100);

  return (
    <div className="mb-8 select-none">
      {/* Mobile: slim progress bar */}
      {isMobile && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r
                         from-emerald-400 to-green-600"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-600 tabular-nums">
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>
      )}

      {/* Connector line (desktop) */}
      <div className="relative">
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-100
                        hidden sm:block z-0" aria-hidden="true">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-green-500
                       origin-left rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: currentStep / (STEPS.length - 1) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step bubbles */}
        <ol className="relative z-10 flex items-start justify-between">
          {STEPS.map((s, i) => {
            const done     = i < currentStep;
            const active   = i === currentStep;
            const upcoming = i > currentStep;

            return (
              <li key={s.id}
                className="flex flex-col items-center flex-1 min-w-0"
                aria-current={active ? "step" : undefined}>

                <button
                  type="button"
                  onClick={() => done && onStepClick?.(i)}
                  disabled={!done}
                  aria-label={`${s.label} — ${done ? "completed, click to revisit" : active ? "current" : "upcoming"}`}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center
                    justify-center border-2 font-bold text-sm
                    transition-all duration-300
                    focus:outline-none focus-visible:ring-2
                    focus-visible:ring-emerald-400 focus-visible:ring-offset-2
                    ${active
                      ? `bg-gradient-to-br from-emerald-400 to-green-600
                         border-transparent text-white scale-110
                         shadow-lg shadow-emerald-200`
                      : done
                        ? `bg-emerald-500 border-transparent text-white
                           cursor-pointer hover:scale-105 hover:bg-emerald-600`
                        : `bg-white border-gray-200 text-gray-300 cursor-default`
                    }
                  `}
                >
                  {done   ? ICON.checkFat : ICON[s.icon]}

                  {/* Active pulse ring */}
                  {active && (
                    <span className="absolute inset-0 rounded-full
                                     border-2 border-emerald-300 animate-ping
                                     opacity-40" aria-hidden="true" />
                  )}
                </button>

                <span className={`
                  mt-2 text-center leading-tight
                  hidden sm:block text-[11px] font-semibold
                  transition-colors duration-300
                  ${active   ? "text-emerald-600"
                  : done     ? "text-emerald-400"
                  :            "text-gray-300"}
                `}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}