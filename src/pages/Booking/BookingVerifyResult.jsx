import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  HiCheckCircle, HiExclamationCircle, HiChatAlt2, HiHome, HiMail,
} from "react-icons/hi";
import GallerySlideshow from "./components/GallerySlideshow";

const WA = "250785751391";

const CONFIG = {
  success: {
    icon: HiCheckCircle, color: "emerald",
    title: (ref) => ref ? `Booking ${ref} Confirmed!` : "Email Verified!",
    message: "Your booking is now with our expert travel team. We'll reach out within 24 hours to craft your perfect itinerary.",
  },
  already_verified: {
    icon: HiCheckCircle, color: "blue",
    title: () => "Already Verified",
    message: "This booking has already been verified. Our team is already working on your itinerary!",
  },
  expired: {
    icon: HiExclamationCircle, color: "amber",
    title: () => "Link Expired",
    message: "For security, verification links expire after 24 hours. Please contact us to resend.",
  },
  invalid: {
    icon: HiExclamationCircle, color: "red",
    title: () => "Invalid Link",
    message: "This verification link is invalid or has been used already.",
  },
  error: {
    icon: HiExclamationCircle, color: "red",
    title: () => "Something Went Wrong",
    message: "We couldn't verify your email. Please contact us to sort it out.",
  },
};

export default function BookingVerifyResult() {
  const [sp] = useSearchParams();
  const status = sp.get("status") || "error";
  const ref = sp.get("ref");
  const cfg = CONFIG[status] || CONFIG.error;
  const Icon = cfg.icon;

  const colors = {
    emerald: { bg: "from-emerald-400 to-emerald-600", ring: "shadow-emerald-200" },
    blue:    { bg: "from-blue-400 to-blue-600",       ring: "shadow-blue-200" },
    amber:   { bg: "from-amber-400 to-amber-600",     ring: "shadow-amber-200" },
    red:     { bg: "from-red-400 to-red-600",         ring: "shadow-red-200" },
  }[cfg.color];

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressBar { from{width:0%} to{width:100%} }
      `}</style>

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-[1040px] bg-white rounded-none sm:rounded-2xl lg:rounded-3xl
                        shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          style={{ maxHeight: "100dvh", height: "100dvh", ...(window.innerWidth >= 640 ? { height: "auto", maxHeight: "92vh" } : {}) }}>

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 z-50" />

          <div className="hidden lg:block lg:w-[46%] xl:w-[48%] relative bg-gray-900 flex-shrink-0">
            <GallerySlideshow />
          </div>
          <div className="lg:hidden relative bg-gray-900 flex-shrink-0" style={{ height: "7rem" }}>
            <GallerySlideshow intervalMs={6000} />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 text-center overflow-y-auto">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full
                            bg-gradient-to-br ${colors.bg} shadow-2xl ${colors.ring} mb-6`}>
              <Icon className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {cfg.title(ref)}
            </h1>

            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
              {cfg.message}
            </p>

            {ref && status === "success" && (
              <div className="inline-flex items-center gap-2.5 bg-emerald-50 border border-emerald-200
                              rounded-2xl px-5 py-3 mb-6 shadow-sm">
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Booking Ref</p>
                  <p className="text-sm font-extrabold text-emerald-700 tracking-wide font-mono">{ref}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d]
                           text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-green-100
                           transition-all hover:-translate-y-0.5">
                <HiChatAlt2 className="w-5 h-5" /> WhatsApp Us
              </a>
              <Link to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200
                           hover:border-emerald-300 hover:text-emerald-700 text-gray-600 font-bold text-sm
                           px-6 py-3.5 rounded-xl transition-all">
                <HiHome className="w-4 h-4" /> Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}