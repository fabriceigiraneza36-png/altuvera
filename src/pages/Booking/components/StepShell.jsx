import React from "react";
import { motion } from "framer-motion";

const V = {
  enter:  { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0  },
  exit:   { opacity: 0, x: -30 },
};

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" opacity="0.25"/>
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
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl
                       bg-gradient-to-br from-emerald-800 to-emerald-950
                       flex items-center justify-center mb-4 text-white
                       shadow-lg shadow-emerald-900/25"
          >
            {icon}
          </motion.div>
        )}
        <motion.h2
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-xl sm:text-2xl lg:text-3xl xl:text-[2rem]
                     font-extrabold text-emerald-950 tracking-tight leading-tight"
          style={{ fontFamily: "'Playfair Display','Georgia',serif" }}
        >
          {heading}
        </motion.h2>
        {subheading && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm sm:text-base lg:text-lg text-gray-500 leading-relaxed"
          >
            {subheading}
          </motion.p>
        )}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="mt-4 h-0.5 w-16 lg:w-20 rounded-full origin-left
                     bg-gradient-to-r from-emerald-700 to-emerald-500"
        />
      </div>

      {/* Content */}
      <div className="space-y-5 lg:space-y-6">{children}</div>

      {/* Nav */}
      <div className={`mt-8 lg:mt-10 flex gap-3 ${isFirst ? "justify-center" : "justify-between"}`}>
        {!isFirst && (
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5
                       rounded-xl border-2 border-gray-200 text-gray-500
                       font-semibold text-sm lg:text-base
                       hover:border-emerald-700 hover:text-emerald-800 hover:bg-emerald-50
                       transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <ArrowLeft /> Back
          </button>
        )}
        <button type="button" onClick={onNext} disabled={submitting}
          className={`inline-flex items-center gap-2.5 font-bold text-white
            rounded-xl transition-all focus:outline-none focus-visible:ring-2
            focus-visible:ring-emerald-600 focus-visible:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed
            ${isFirst ? "w-full justify-center py-4 px-8 text-base lg:text-lg" : "px-7 py-3 lg:px-9 lg:py-3.5 text-sm lg:text-base"}
            ${!submitting
              ? "bg-gradient-to-br from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 shadow-lg shadow-emerald-900/25 hover:shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-emerald-700"}
          `}>
          {submitting
            ? <><Spinner /> Sending...</>
            : <>{nextLabel} {isLast ? <CheckIcon /> : <ArrowRight />}</>}
        </button>
      </div>
    </motion.div>
  );
}