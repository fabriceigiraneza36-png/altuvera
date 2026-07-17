import React from "react";
import { motion } from "framer-motion";

const BADGES = [
  {
    label: "Secure & Private",
    sub: "256-bit encrypted",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: "Free Consultation",
    sub: "No commitment",
    color: "text-blue-500",
    bg: "bg-blue-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0
             01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0
             01-2 2h-5l-5 5v-5z"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp Support",
    sub: "Real humans, 24/7",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099
          -.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223
          -.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761
          -1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446
          -.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075
          -.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008
          -.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016
          -1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2
          5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871
          .118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173
          -1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12
          c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 00.921.916
          l5.474-1.503A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627
          0 12 0zm0 22a9.95 9.95 0 01-5.127-1.415l-.369-.218-3.822 1.049
          1.016-3.711-.237-.381A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10
          4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    label: "Expert Guided",
    sub: "10+ years East Africa",
    color: "text-amber-500",
    bg: "bg-amber-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="8" r="6"/>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
];

export default function TrustBadges({ isMobile }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8">
      {BADGES.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.07 }}
          className="flex items-center gap-2 bg-white/85 backdrop-blur-sm
                     border border-gray-100 rounded-full shadow-sm
                     px-3 py-2"
        >
          <span className={`${b.color} flex-shrink-0`}>{b.icon}</span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-gray-700">{b.label}</p>
            <p className="text-[10px] text-gray-400">{b.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}