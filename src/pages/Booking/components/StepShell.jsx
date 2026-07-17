import React from "react";
import { motion } from "framer-motion";

const V = {
  enter:  { opacity: 0, x: 30, scale: 0.98 },
  center: { opacity: 1, x: 0,  scale: 1    },
  exit:   { opacity: 0, x: -30, scale: 0.98 },
};

/* SVG Arrow icons */
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" opacity="0.2"/>
    <path strokeLinecap="round" d="M12 2a10 10 0 0110 10"/>
  </svg>
);

export default function StepShell({
  stepKey, icon, heading, subheading, children,
  onNext, onBack, nextLabel = "Continue",
  submitting = false, isFirst = false, isLast = false,
}) {
  return (
    <motion.div
      key={stepKey}
      variants={V}
      initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Heading */}
      <div className="mb-6 lg:mb-8">
        {icon && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-emerald-50
                       border border-emerald-100 flex items-center justify-center
                       mb-4 text-emerald-600"
          >
            {icon}
          </motion.div>
        )}
        <motion.h2
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl
                     font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          {heading}
        </motion.h2>
        {subheading && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm sm:text-base lg:text-lg
                       text-gray-500 leading-relaxed"
          >
            {subheading}
          </motion.p>
        )}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="mt-3 h-0.5 w-12 lg:w-16 rounded-full origin-left
                     bg-gradient-to-r from-emerald-400 to-green-500"
        />
      </div>

      {/* Content */}
      <div className="space-y-4 lg:space-y-5">{children}</div>

      {/* Navigation */}
      <div className={`mt-8 lg:mt-10 flex gap-3 ${isFirst ? "justify-center" : "justify-between"}`}>
        {!isFirst && (
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5
                       rounded-2xl border-2 border-gray-200 text-gray-500
                       font-semibold text-sm lg:text-base
                       hover:border-emerald-300 hover:text-emerald-700
                       hover:bg-emerald-50/50 transition-all
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <ArrowLeft /> Back
          </button>
        )}
        <button type="button" onClick={onNext} disabled={submitting}
          className={`inline-flex items-center gap-2.5 font-bold text-white
            rounded-2xl transition-all focus:outline-none focus-visible:ring-2
            focus-visible:ring-emerald-400 focus-visible:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed
            ${isFirst ? "w-full justify-center py-4 px-8 text-base lg:text-lg" : "px-6 py-3 lg:px-8 lg:py-3.5 text-sm lg:text-base"}
            ${!submitting
              ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200/60 hover:shadow-emerald-300/60 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-emerald-400"}
          `}>
          {submitting
            ? <><Spinner /> Sending...</>
            : <>{nextLabel} {isLast ? <CheckIcon /> : <ArrowRight />}</>}
        </button>
      </div>
    </motion.div>
  );
}