import React from "react";
import { motion } from "framer-motion";

const WA_NUMBER = "250785751391";

export default function WhatsAppBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between gap-3
                 bg-white/90 backdrop-blur-sm border border-emerald-100
                 rounded-2xl px-4 py-3 mb-6 shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* WA icon */}
        <span className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center
                          justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5"
            aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273
              -.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199
              -.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788
              -1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133
              .298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371
              -.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5
              -.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
              -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 
              3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694
              .625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006
              -1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57
              -.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 
              5.855L.057 23.428a.75.75 0 00.921.916l5.474-1.503A11.95 11.95 
              0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 
              9.95 0 01-5.127-1.415l-.369-.218-3.822 1.049 1.016-3.711
              -.237-.381A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 
              10 10-4.477 10-10 10z"/>
          </svg>
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 leading-tight">
            Prefer to talk to a person?
          </p>
          <p className="text-xs text-gray-500 truncate">
            Our safari experts are online now — chat instantly
          </p>
        </div>
      </div>

      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank" rel="noopener noreferrer"
        className="flex-shrink-0 inline-flex items-center gap-1.5
                   bg-[#25D366] hover:bg-[#1ebe5d] text-white
                   font-bold text-xs px-3.5 py-2 rounded-xl
                   transition-colors whitespace-nowrap"
      >
        Chat Now
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" className="w-3 h-3" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </motion.div>
  );
}