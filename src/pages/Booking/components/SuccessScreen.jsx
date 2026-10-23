import React, { useState } from "react";
import {
  HiCheckCircle,
  HiChatAlt2,
  HiPlus,
  HiOutlineMail,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineClipboardCopy,
  HiCheck,
  HiArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";

const WA = "250785751391";

export default function SuccessScreen({ displayName, bookingRef, email, category, onReset }) {
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    if (!bookingRef) return;
    try {
      await navigator.clipboard.writeText(String(bookingRef));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be blocked in some browsers; the reference remains selectable.
      setCopied(false);
    }
  };

  return (
    <main className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-7 sm:px-6 sm:py-12 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl sm:h-80 sm:w-80" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-56 h-56 w-56 rounded-full bg-amber-100/50 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl">
        <section className="overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-950/[0.07] sm:rounded-[2rem]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] px-5 pb-8 pt-8 text-center text-white sm:px-10 sm:pb-10 sm:pt-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/10 sm:h-56 sm:w-56" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-10 -bottom-24 h-48 w-48 rounded-full border border-white/10" />

            <div className="relative mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.5rem] bg-white text-emerald-700 shadow-lg shadow-emerald-950/20 ring-8 ring-white/10 sm:h-20 sm:w-20 sm:rounded-[1.7rem]">
              <HiCheckCircle className="h-11 w-11 sm:h-12 sm:w-12" aria-hidden="true" />
            </div>
            <p className="relative mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-50 sm:text-xs">
              <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
              Booking request received
            </p>
            <h1 className="relative mx-auto mt-4 max-w-2xl text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
              {displayName ? `You're all set, ${displayName}!` : "Your adventure starts here."}
            </h1>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-50/95 sm:text-base sm:leading-7">
              Thank you for choosing Altuvera Safaris. We’ve received your request and our team will help you plan an unforgettable African journey.
            </p>
          </div>

          <div className="px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
            {bookingRef && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-5">
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-800/70">Your booking reference</p>
                  <p className="mt-1.5 break-all font-mono text-base font-extrabold tracking-wide text-emerald-950 sm:text-lg">{bookingRef}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-900/75">Save this number so you can easily refer to your request.</p>
                </div>
                <button
                  type="button"
                  onClick={copyReference}
                  className="mt-3 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:mt-0 sm:w-auto"
                  aria-label="Copy booking reference"
                >
                  {copied ? <HiCheck className="h-4 w-4" aria-hidden="true" /> : <HiOutlineClipboardCopy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied" : "Copy reference"}
                </button>
              </div>
            )}

            {email && (
              <div className="mb-6 flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3 sm:px-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <HiOutlineMail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">Check your email</p>
                  <p className="mt-0.5 break-all text-sm leading-5 text-slate-600">We’ll send updates to <span className="font-semibold text-slate-800">{email}</span>.</p>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3.5 sm:block sm:p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <HiOutlineShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 sm:mt-3">
                  <h2 className="text-sm font-extrabold text-slate-900">Request secured</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Your request has been submitted to our team for review.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3.5 sm:block sm:p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <HiOutlineClock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 sm:mt-3">
                  <h2 className="text-sm font-extrabold text-slate-900">What happens next?</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Our travel team aims to contact you within 24 hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3.5 sm:block sm:p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <HiOutlineMail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 sm:mt-3">
                  <h2 className="text-sm font-extrabold text-slate-900">Stay reachable</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Keep an eye on your inbox and check your spam folder too.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 sm:mt-7 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
              <div className="text-center sm:text-left">
                <h2 className="text-base font-extrabold text-slate-900">Have a question about your trip?</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">Talk directly with our team if you need help or want to add details.</p>
              </div>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#128c55] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0b7445] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:mt-0 sm:w-auto"
              >
                <HiChatAlt2 className="h-5 w-5" aria-hidden="true" />
                Chat on WhatsApp
                <HiArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto sm:min-w-52"
              >
                <HiPlus className="h-4 w-4" aria-hidden="true" />
                Make another request
              </button>
              <a
                href="/"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                Back to homepage
                <HiArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">Altuvera Safaris · Thoughtfully planned journeys across Africa</p>
          </div>
        </section>
      </div>
    </main>
  );
}
