import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useParams, useNavigate, Navigate } from "react-router-dom";
import {
  HiArrowLeft, HiArrowRight, HiCheck, HiSparkles, HiShieldCheck,
  HiInformationCircle, HiExclamationCircle, HiCheckCircle, HiX,
  HiChatAlt2,
} from "react-icons/hi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";

import { BookingProvider, useBookingContext } from "./BookingContext";
import GallerySlideshow from "./components/GallerySlideshow";
import SuccessScreen    from "./components/SuccessScreen";
import { Spinner }      from "./components/FormComponents";

import Step0Identity    from "./steps/Step0Identity";
import Step1Destination from "./steps/Step1Destination";
import Step2Trip        from "./steps/Step2Trip";
import Step3Contact     from "./steps/Step3Contact";

import { useCountriesList }    from "../../hooks/useCountriesList";
import { useDestinationsList } from "../../hooks/useDestinationsList";

const WA = "250785751391";

/* ────────────────────────────────────────────────────────────────────────────
   Inner page — renders inside the app shell (Navbar + Footer).
   Step index is driven by the URL: /booking/step/:step
──────────────────────────────────────────────────────────────────────────── */
function BookingPage() {
  const { data: rc = [] } = useCountriesList?.() || {};
  const { data: rd = [] } = useDestinationsList?.() || {};

  const countriesList = useMemo(
    () => rc.map(c => ({ value: String(c.id), label: c.name })), [rc]);
  const destinationsList = useMemo(
    () => rd.map(d => {
      const countryId =
        d.country_id || d.countryId ||
        (d.country && d.country.id) || (d.countryObj && d.countryObj.id) || "";
      const countryName =
        d.country_name || d.countryName ||
        (typeof d.country === "string" ? d.country : "") ||
        (d.country && d.country.name) || (d.countryObj && d.countryObj.name) || "";
      return {
        value: String(d.id), label: d.name,
        countryId: countryId ? String(countryId) : "",
        country: countryName,
        image: d.heroImage || d.imageUrl ||
          (Array.isArray(d.images) ? d.images[0] : undefined) ||
          (Array.isArray(d.gallery) && d.gallery[0]?.imageUrl) || null,
      };
    }), [rd]);

  const form = useBookingContext();
  const navigate = useNavigate();

  // Hero override: when a destination is selected, surface its backend image
  // in the gallery for 5s, then the standard slideshow keeps moving.
  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(
      d => String(d.value) === String(form.data.destinationId),
    );
    if (!dest || !dest.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
  }, [destinationsList, form.data.destinationId]);

  /* ── Prefill from ?destination= (shared link) ── */
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

  const firstInputRef = useRef(null);
  useEffect(() => { setTimeout(() => firstInputRef.current?.focus(), 350); }, [form.step]);

  const props = {
    data: form.data, set: form.set, touch: form.touch,
    errors: form.errors, touched: form.touched,
    countriesList, destinationsList, firstInputRef,
  };

  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Identity     {...props} />;
      case 1: return <Step1Destination  {...props} />;
      case 2: return <Step2Trip         {...props} />;
      case 3: return <Step3Contact      {...props} />;
      default: return null;
    }
  };

  const isLast = form.step === form.STEPS.length - 1;

  const goStep = useCallback((s) => {
    navigate(s > 0 ? `/booking/step/${s}` : "/booking");
  }, [navigate]);

  const handleNext = () => {
    if (isLast) { form.submit(); }
    else if (form.tryNext()) { goStep(form.step + 1); }
  };
  const handleBack = () => {
    form.goBack();
    goStep(form.step - 1);
  };
  const handleStepClick = (i) => {
    if (i <= form.step) { form.jumpTo(i); goStep(i); }
  };

  /* ── Success (submitted) → dedicated route ── */
  if (form.submitted) {
    return <Navigate to="/booking/success" replace />;
  }

  const HEADINGS = [
    form.displayName ? `Hi ${form.displayName}!` : "Let's get started",
    "Where to?",
    "When & how many?",
    "Send your request",
  ];

  return (
    <div className="am-fadeIn min-h-[70vh] bg-gradient-to-b from-emerald-50/40 to-white py-8 sm:py-12">
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes viewIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepIn    { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleX    { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        .am-fadeIn    { animation: fadeIn     300ms ease-out both; }
        .am-viewIn    { animation: viewIn     350ms ease-out both; }
        .am-stepIn    { animation: stepIn     350ms ease-out both; }
        .am-slideDown { animation: slideDown  300ms ease-out both; }
        .am-scaleX    { animation: scaleX     250ms ease-out both; transform-origin:left; }

        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
        }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="relative w-full bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden
                        flex flex-col lg:flex-row border border-emerald-100">

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 z-50" />

          {/* Gallery — desktop */}
          <div className="hidden lg:block lg:w-[46%] xl:w-[48%] relative bg-gray-900 flex-shrink-0 min-h-[560px]">
            <GallerySlideshow hero={heroOverride} />
          </div>
          {/* Gallery — mobile strip */}
          <div className="lg:hidden relative bg-gray-900 flex-shrink-0" style={{ height: "8rem" }}>
            <GallerySlideshow intervalMs={6000} hero={heroOverride} />
          </div>

          {/* Form panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Book Your Safari</h3>
              </div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d]
                           text-white text-xs font-semibold transition-all">
                <HiChatAlt2 className="w-4 h-4" />
                <span className="hidden sm:inline">Chat with expert</span>
                <span className="sm:hidden">Chat</span>
              </a>
            </div>

            {/* Stepper */}
            <div className="flex border-b border-gray-100 px-4 sm:px-6 flex-shrink-0">
              {form.STEPS.map((s, i) => {
                const active = form.step === i;
                const done = form.step > i;
                const canClick = done;
                return (
                  <button key={s.id} type="button"
                    onClick={() => handleStepClick(i)}
                    disabled={!canClick}
                    className={`relative flex-1 sm:flex-initial flex items-center gap-1.5 px-2 sm:px-4 py-3
                      text-[11px] sm:text-sm font-semibold transition-all
                      ${active ? "text-emerald-600" : done ? "text-emerald-500" : "text-gray-400"}
                      ${canClick ? "cursor-pointer hover:text-emerald-700" : "cursor-default"}`}>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                      ${active ? "bg-emerald-500 text-white" : done ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                      {done ? <HiCheck className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                    {active && (
                      <span className="am-scaleX absolute bottom-0 left-1 right-1 sm:left-3 sm:right-3 h-0.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-x-hidden px-4 sm:px-6 py-5">

              {form.submitError && (
                <div className="am-slideDown mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
                  <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 mb-2">{form.submitError}</p>
                    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d]
                                 text-white text-xs font-semibold transition-all">
                      <HiChatAlt2 className="w-3.5 h-3.5" /> Contact us on WhatsApp
                    </a>
                  </div>
                  <button onClick={() => form.setSubmitError(null)}
                    className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors">
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="am-viewIn">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl
                                  bg-gradient-to-br from-emerald-100 to-emerald-50 mb-3 p-3">
                    <HiSparkles className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    {HEADINGS[form.step]}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {form.STEPS[form.step]?.desc}
                  </p>
                </div>

                <div key={form.step} className="am-stepIn">
                  {renderStep()}
                </div>

                <div className={`mt-6 flex gap-3 ${form.step === 0 ? "justify-end" : "justify-between"}`}>
                  {form.step > 0 && (
                    <button type="button" onClick={handleBack} disabled={form.submitting}
                      className="flex items-center gap-2 px-4 h-11 rounded-xl text-gray-600 font-medium text-sm
                                 hover:bg-gray-100 transition-all">
                      <HiArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <button type="button" onClick={handleNext} disabled={form.submitting}
                    className="flex-1 sm:flex-initial h-12 px-6 rounded-xl bg-emerald-600 text-white font-semibold text-sm
                               flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg
                               hover:shadow-emerald-200 active:scale-[0.98] disabled:opacity-50
                               disabled:cursor-not-allowed transition-all">
                    {form.submitting ? (
                      <><Spinner /> Sending…</>
                    ) : isLast ? (
                      <><HiCheck className="w-4 h-4" /> Send My Request</>
                    ) : (
                      <>Continue <HiArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
                  {[
                    { icon: RiShieldKeyholeLine, text: "Secure" },
                    { icon: MdVerified,          text: "No payment now" },
                    { icon: HiShieldCheck,       text: "Expert guides" },
                  ].map(({ icon: BI, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <BI className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <RiShieldKeyholeLine className="w-3.5 h-3.5 text-emerald-500" />
                256-bit SSL encryption • No payment required • WhatsApp negotiation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Step router — maps /booking/step/:step onto the context step index.
──────────────────────────────────────────────────────────────────────────── */
function BookingStepRoute() {
  const { step } = useParams();
  const navigate = useNavigate();
  const form = useBookingContext();
  const idx = step === undefined ? 0 : parseInt(step, 10);

  useEffect(() => {
    if (Number.isNaN(idx) || idx < 0 || idx > form.STEPS.length - 1) {
      navigate("/booking", { replace: true });
      return;
    }
    if (idx !== form.step) form.goTo(idx);
  }, [idx, form.step]); // eslint-disable-line

  return <BookingPage />;
}

/* ────────────────────────────────────────────────────────────────────────────
   Success route.
──────────────────────────────────────────────────────────────────────────── */
function BookingSuccessRoute() {
  const form = useBookingContext();
  if (!form.submitted) return <Navigate to="/booking" replace />;
  return (
    <div className="am-fadeIn min-h-[70vh] bg-gradient-to-b from-emerald-50/40 to-white py-8 sm:py-12">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="relative w-full bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden
                        flex flex-col lg:flex-row border border-emerald-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 z-50" />
          <div className="hidden lg:block lg:w-[46%] xl:w-[48%] relative bg-gray-900 flex-shrink-0 min-h-[560px]">
            <GallerySlideshow />
          </div>
          <div className="lg:hidden relative bg-gray-900 flex-shrink-0" style={{ height: "8rem" }}>
            <GallerySlideshow intervalMs={6000} />
          </div>
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
              <SuccessScreen
                displayName={form.displayName}
                bookingRef={form.bookingRef}
                email={form.data.email}
                onReset={form.reset}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Public export — wraps everything in the provider.
──────────────────────────────────────────────────────────────────────────── */
export default function Booking() {
  return (
    <BookingProvider>
      <BookingRoutes />
    </BookingProvider>
  );
}

function BookingRoutes() {
  const form = useBookingContext();
  // Render the success screen as a full route only when submitted; otherwise
  // the default landing is step 0.
  if (form.submitted) return <BookingSuccessRoute />;
  return <BookingPage />;
}
