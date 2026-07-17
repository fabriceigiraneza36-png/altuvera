import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { useBookingForm, STEPS } from "./useBookingForm";
import SuccessScreen    from "./components/SuccessScreen";
import Step0Name        from "./steps/Step0Name";
import Step1Destination from "./steps/Step1Destination";
import Step2Travel      from "./steps/Step2Travel";
import Step3Contact     from "./steps/Step3Contact";

import { useCountriesList }    from "../../hooks/useCountriesList";
import { useDestinationsList } from "../../hooks/useDestinationsList";

const WA = "250785751391";

/* Subtle safari background — public Unsplash / Pexels images */
const BG_IMAGE = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80&auto=format&fit=crop";

export default function Booking() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    let r;
    const h = () => { cancelAnimationFrame(r); r = requestAnimationFrame(() => setW(window.innerWidth)); };
    window.addEventListener("resize", h, { passive: true });
    return () => { cancelAnimationFrame(r); window.removeEventListener("resize", h); };
  }, []);

  const { data: rc = [] } = useCountriesList?.() || {};
  const { data: rd = [] } = useDestinationsList?.() || {};

  const countriesList = useMemo(
    () => rc.map(c => ({ value: String(c.id), label: c.name })), [rc]);
  const destinationsList = useMemo(
    () => rd.map(d => ({
      value: String(d.id), label: d.name,
      countryId: d.country_id ? String(d.country_id) : undefined,
      country: d.country_name || d.country || "",
    })), [rd]);

  const form = useBookingForm({ countriesList, destinationsList });

  const [sp] = useSearchParams();
  const ar = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || ar.current === s || !destinationsList.length) return;
    const m = destinationsList.find(
      d => d.label.toLowerCase().replace(/\s+/g, "-") === s || String(d.value) === s);
    if (m) {
      ar.current = s;
      form.set("destinationId", m.value);
      if (m.countryId) form.set("countryId", m.countryId);
    }
  }, [sp, destinationsList]); // eslint-disable-line

  const props = {
    data: form.data, set: form.set, touch: form.touch,
    errors: form.errors, touched: form.touched,
    displayName: form.displayName, onBack: form.goBack,
    countriesList, destinationsList,
  };

  const pct = Math.round(((form.step + 1) / STEPS.length) * 100);

  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Name        {...props} onNext={form.tryNext} />;
      case 1: return <Step1Destination {...props} onNext={form.tryNext} />;
      case 2: return <Step2Travel      {...props} onNext={form.tryNext} />;
      case 3: return <Step3Contact     {...props}
        onNext={form.submit}
        submitting={form.submitting}
        submitError={form.submitError}
        onDismissError={() => form.setSubmitError(null)}
        getCountryName={form.getCountryName}
        getDestinationName={form.getDestinationName}
      />;
      default: return null;
    }
  };

  /* ── Success ── */
  if (form.submitted) {
    return (
      <section className="relative w-full py-12 lg:py-20 px-4 min-h-[85vh] flex items-center justify-center bg-gray-50">
        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <SuccessScreen
            displayName={form.displayName}
            bookingRef={form.bookingRef}
            email={form.data.email}
            onReset={form.reset}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-8 sm:py-12 lg:py-16 xl:py-20 px-3 sm:px-6 min-h-[85vh]
                        overflow-hidden bg-gray-50">
      {/* ── BG image with dark green overlay ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})`, opacity: 0.12 }}
        />
        <div className="absolute inset-0 bg-gradient-to-br
                        from-emerald-50/95 via-white/90 to-emerald-100/80" />
        {/* Dot pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, #065f46 1px, transparent 1px)",
          backgroundSize: "40px 40px", opacity: 0.03,
        }}/>
      </div>

      <div className="relative z-10 w-full max-w-[85%] xl:max-w-[80%] 2xl:max-w-6xl mx-auto flex flex-col items-center">

        {/* Header row: title + WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full flex items-center justify-between mb-4 lg:mb-6"
        >
          <div>
            <p className="text-[10px] lg:text-xs font-extrabold uppercase tracking-widest text-emerald-800">
              Book Your Safari
            </p>
            <h1 className="text-lg lg:text-2xl font-extrabold text-emerald-950 leading-tight"
              style={{ fontFamily: "'Playfair Display','Georgia',serif" }}>
              Plan Your Adventure
            </h1>
          </div>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d]
                       text-white font-bold text-xs lg:text-sm px-3 lg:px-4 py-2 lg:py-2.5
                       rounded-xl transition-colors shadow-lg shadow-green-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 00.921.916l5.474-1.503A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
            <span className="hidden sm:inline">Chat with expert</span>
          </a>
        </motion.div>

        {/* Stepper */}
        <div className="w-full mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center flex-1 relative">
                {i > 0 && (
                  <div className="absolute right-1/2 top-3.5 w-full h-0.5 bg-gray-200 -z-10">
                    <motion.div
                      className="h-full bg-emerald-700"
                      initial={{ width: 0 }}
                      animate={{ width: i <= form.step ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center
                  text-xs font-extrabold transition-all
                  ${i < form.step
                    ? "bg-emerald-700 border-emerald-700 text-white"
                    : i === form.step
                      ? "bg-white border-emerald-700 text-emerald-800 ring-4 ring-emerald-100"
                      : "bg-white border-gray-200 text-gray-300"}`}>
                  {i < form.step ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`hidden sm:block mt-1.5 text-[10px] font-bold uppercase tracking-wider
                  ${i === form.step ? "text-emerald-800" :
                    i < form.step ? "text-emerald-600" : "text-gray-300"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
           FORM CARD — 80% width, professional design
        ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full bg-white rounded-3xl
                     shadow-2xl shadow-emerald-950/10
                     border border-gray-100 overflow-hidden"
        >
          {/* Dark green top bar */}
          <div className="h-1.5 lg:h-2 w-full bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600"
            aria-hidden="true"/>

          <div className="grid lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_2.5fr]">
            {/* Left panel — dark green info sidebar (hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between
                            bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800
                            text-white p-8 xl:p-10 relative overflow-hidden">
              {/* Bg image overlay */}
              <div className="absolute inset-0 opacity-10 bg-cover bg-center"
                style={{ backgroundImage: `url(${BG_IMAGE})` }} aria-hidden="true" />

              <div className="relative z-10">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 mb-2">
                  Step {form.step + 1} of {STEPS.length}
                </p>
                <h2 className="text-2xl xl:text-3xl font-extrabold leading-tight mb-4"
                  style={{ fontFamily: "'Playfair Display','Georgia',serif" }}>
                  {STEPS[form.step]?.label}
                </h2>
                <div className="h-0.5 w-12 bg-emerald-400 mb-4" />
                <p className="text-sm xl:text-base text-emerald-100 leading-relaxed">
                  {[
                    "Tell us who you are so we can personalise your journey.",
                    "Choose the destination that speaks to your soul.",
                    "Share your dates, group, and any special wishes.",
                    "Send it over — we'll craft your itinerary within 24 hours.",
                  ][form.step]}
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-emerald-400"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-bold text-emerald-300 tabular-nums">{pct}%</span>
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  {form.step + 1} of {STEPS.length} completed
                </p>
              </div>

              {/* Trust pills */}
              <div className="relative z-10 mt-8 space-y-2">
                {[
                  ["Free consultation", "No payment now"],
                  ["Expert guides",     "10+ years East Africa"],
                  ["24/7 WhatsApp",     "Real human support"],
                ].map(([l, s]) => (
                  <div key={l} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30
                                    flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                        className="w-3 h-3 text-emerald-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{l}</p>
                      <p className="text-[10px] text-emerald-200/70">{s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel — form content */}
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
              <AnimatePresence mode="wait">
                <React.Fragment key={form.step}>
                  {renderStep()}
                </React.Fragment>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Below-card note */}
        <p className="mt-4 text-xs text-gray-500 text-center max-w-md">
          Your information is secure and only used to plan your trip.
          No payment required at this stage — we negotiate everything with you on WhatsApp.
        </p>
      </div>
    </section>
  );
}