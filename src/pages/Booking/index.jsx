import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { useBookingForm, STEPS } from "./useBookingForm";
import SuccessScreen    from "./components/SuccessScreen";
import Step0Name        from "./steps/Step0Name";
import Step1Destination from "./steps/Step1Destination";
import Step2Travel      from "./steps/Step2Travel";
import Step3Travelers   from "./steps/Step3Travelers";
import Step4Contact     from "./steps/Step4Contact";
import Step5Review      from "./steps/Step5Review";

import { useCountriesList }    from "../../hooks/useCountriesList";
import { useDestinationsList } from "../../hooks/useDestinationsList";

const WA = "250785751391";

export default function Booking() {
  /* ── responsive ── */
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    let r;
    const h = () => { cancelAnimationFrame(r); r = requestAnimationFrame(() => setW(window.innerWidth)); };
    window.addEventListener("resize", h, { passive: true });
    return () => { cancelAnimationFrame(r); window.removeEventListener("resize", h); };
  }, []);

  /* ── data ── */
  const { data: rc = [] } = useCountriesList?.() || {};
  const { data: rd = [] } = useDestinationsList?.() || {};

  const countriesList = useMemo(
    () => rc.map(c => ({ value: String(c.id), label: c.name })),
    [rc],
  );
  const destinationsList = useMemo(
    () => rd.map(d => ({
      value: String(d.id),
      label: d.name,
      countryId: d.country_id ? String(d.country_id) : undefined,
      country: d.country_name || d.country || "",
    })),
    [rd],
  );

  /* ── form state ── */
  const form = useBookingForm({ countriesList, destinationsList });

  /* ── URL prefill ── */
  const [sp] = useSearchParams();
  const ar = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || ar.current === s || !destinationsList.length) return;
    const m = destinationsList.find(
      d => d.label.toLowerCase().replace(/\s+/g, "-") === s || String(d.value) === s,
    );
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

  const pct = Math.round((form.step / (STEPS.length - 1)) * 100);

  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Name        {...props} onNext={form.tryNext} />;
      case 1: return <Step1Destination {...props} onNext={form.tryNext} />;
      case 2: return <Step2Travel      {...props} onNext={form.tryNext} />;
      case 3: return <Step3Travelers   {...props} onNext={form.tryNext} />;
      case 4: return <Step4Contact     {...props} onNext={form.tryNext} submitting={form.submitting} />;
      case 5: return (
        <Step5Review {...props}
          getDestinationName={form.getDestinationName}
          getCountryName={form.getCountryName}
          onNext={form.submit}
          submitting={form.submitting}
          submitError={form.submitError}
          onDismissError={() => form.setSubmitError(null)}
        />
      );
      default: return null;
    }
  };

  /* ══════════════════════════════════════════════
     SUCCESS
  ══════════════════════════════════════════════ */
  if (form.submitted) {
    return (
      <section className="relative w-full bg-gradient-to-br from-emerald-50 via-white to-green-50
                          py-10 sm:py-14 lg:py-20 px-4 min-h-[85vh] flex items-center justify-center">
        <BgDecor />
        <div className="relative z-10 w-full max-w-2xl xl:max-w-3xl mx-auto">
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

  /* ══════════════════════════════════════════════
     MAIN FORM
  ══════════════════════════════════════════════ */
  return (
    <section className="relative w-full bg-gradient-to-br from-emerald-50 via-white to-green-50
                        py-8 sm:py-12 lg:py-16 xl:py-20 px-4 min-h-[85vh] overflow-hidden">
      <BgDecor />

      <div className="relative z-10 w-full max-w-2xl xl:max-w-3xl mx-auto flex flex-col items-center">

        {/* ── WhatsApp banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3 lg:mb-4"
        >
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm
                          border border-emerald-100 rounded-2xl px-3 sm:px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#25D366]/10 rounded-lg
                              flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 00.921.916l5.474-1.503A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">
                Prefer chatting? Our experts are online
              </p>
            </div>
            <a
              href={`https://wa.me/${WA}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 bg-[#25D366] hover:bg-[#1ebe5d]
                         text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Chat
            </a>
          </div>
        </motion.div>

        {/* ── Progress bar ── */}
        <div className="w-full mb-4 lg:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 lg:h-2 bg-white/70 rounded-full overflow-hidden
                            border border-emerald-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-600 tabular-nums whitespace-nowrap">
              {form.step + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════
           FORM CARD
        ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl
                     shadow-2xl shadow-emerald-100/50
                     border border-white/80 overflow-hidden"
        >
          {/* Top accent */}
          <div
            aria-hidden="true"
            className="h-1 lg:h-1.5 w-full bg-gradient-to-r
                       from-emerald-300 via-green-400 to-emerald-500"
          />

          {/* Step header */}
          <div className="flex items-center justify-between
                          px-5 sm:px-7 lg:px-10 xl:px-12
                          pt-4 lg:pt-5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-emerald-500
                               flex items-center justify-center
                               text-[10px] lg:text-xs font-extrabold text-white">
                {form.step + 1}
              </span>
              <span className="text-xs lg:text-sm font-bold text-emerald-600
                               uppercase tracking-wider">
                {STEPS[form.step]?.label}
              </span>
            </div>
            <span className="text-[10px] lg:text-xs text-gray-400 font-medium">
              {form.step + 1} of {STEPS.length}
            </span>
          </div>

          {/* Form content */}
          <div className="px-5 sm:px-7 lg:px-10 xl:px-12
                          py-5 sm:py-6 lg:py-8 xl:py-10">
            <AnimatePresence mode="wait">
              <React.Fragment key={form.step}>
                {renderStep()}
              </React.Fragment>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Step label */}
        <motion.p
          key={form.step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-gray-400 font-medium text-center"
        >
          Step {form.step + 1} of {STEPS.length} ·{" "}
          <span className="text-emerald-500 font-bold">
            {STEPS[form.step]?.label}
          </span>
        </motion.p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 lg:mt-7">
          {[
            { l: "Secure",       s: "Encrypted"      },
            { l: "Free Consult", s: "No payment"     },
            { l: "WhatsApp 24/7",s: "Real humans"    },
            { l: "10+ Years",    s: "Expert guides"  },
          ].map((b, i) => (
            <motion.div
              key={b.l}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex items-center gap-1.5 bg-white/80
                         border border-emerald-100 rounded-full
                         px-2.5 py-1.5 shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" className="w-3 h-3 text-emerald-500 flex-shrink-0"
                aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944
                     a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0
                     5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03
                     9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-gray-700">{b.l}</p>
                <p className="text-[9px] text-gray-400">{b.s}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Decorative background ── */
function BgDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: 0.025,
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-60 -right-60 w-[500px] h-[500px]
                   rounded-full bg-emerald-200/25 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], x: [0, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px]
                   rounded-full bg-green-200/20 blur-3xl"
      />
    </div>
  );
}