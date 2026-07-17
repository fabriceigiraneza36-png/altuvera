import React from "react";
import { motion } from "framer-motion";

const variants = {
  enter:  { opacity: 0, x: 32,  scale: 0.98 },
  center: { opacity: 1, x: 0,   scale: 1    },
  exit:   { opacity: 0, x: -32, scale: 0.98 },
};

export default function StepShell({
  stepKey, heading, subheading, children,
  onNext, onBack, nextLabel = "Continue",
  submitting = false, isFirst = false, isLast = false,
}) {
  return (
    <motion.div
      key={stepKey}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Heading */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-2xl sm:text-3xl font-extrabold text-gray-900
                     tracking-tight leading-tight"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
        >
          {heading}
        </motion.h2>

        {subheading && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2.5 text-base text-gray-500 leading-relaxed"
          >
            {subheading}
          </motion.p>
        )}

        {/* Decorative underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="mt-4 h-0.5 w-16 rounded-full origin-left
                     bg-gradient-to-r from-emerald-400 to-green-500"
        />
      </div>

      {/* Content */}
      <div className="space-y-5">{children}</div>

      {/* Navigation */}
      <div className={`
        mt-10 flex gap-3 items-center
        ${isFirst ? "justify-center" : "justify-between"}
      `}>
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3
                       rounded-2xl border-2 border-gray-200
                       text-gray-500 font-semibold text-sm
                       hover:border-emerald-300 hover:text-emerald-700
                       hover:bg-emerald-50/50 transition-all duration-200
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-emerald-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className={`
            inline-flex items-center gap-2.5 font-bold text-sm text-white
            rounded-2xl transition-all duration-200 focus:outline-none
            focus-visible:ring-2 focus-visible:ring-emerald-400
            focus-visible:ring-offset-2 disabled:opacity-60
            disabled:cursor-not-allowed
            ${isFirst
              ? "w-full justify-center py-4 px-8 text-base"
              : "px-7 py-3"}
            ${!submitting
              ? `bg-gradient-to-r from-emerald-500 to-green-600
                 hover:from-emerald-600 hover:to-green-700
                 shadow-lg shadow-emerald-100 hover:shadow-emerald-200
                 hover:-translate-y-0.5 active:translate-y-0`
              : "bg-emerald-400"}
          `}
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                aria-hidden="true">
                <path strokeLinecap="round"
                  d="M12 2a10 10 0 0110 10" opacity="0.3"/>
                <path strokeLinecap="round"
                  d="M12 2a10 10 0 0110 10"/>
              </svg>
              Sending…
            </>
          ) : (
            <>
              {nextLabel}
              {!isLast && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5l7 7-7 7"/>
                </svg>
              )}
              {isLast && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}