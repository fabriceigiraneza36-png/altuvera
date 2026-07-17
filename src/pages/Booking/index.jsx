/**
 * Booking/index.jsx — v8.1
 * Fixed: removed top-level await dynamic imports → static imports only
 */
import React, {
  useState, useEffect, useMemo, useRef, useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

/* ── Common components ── */
import PageHeader      from "../../components/common/PageHeader";
import AnimatedSection from "../../components/common/AnimatedSection";

/* ── Booking-specific ── */
import { useBookingForm, STEPS } from "./useBookingForm";
import ProgressBar     from "./components/ProgressBar";
import StairBackground from "./components/StairBackground";
import TrustBadges     from "./components/TrustBadges";
import WhatsAppBanner  from "./components/WhatsAppBanner";
import SuccessScreen   from "./components/SuccessScreen";

/* ── Steps ── */
import Step0Name        from "./steps/Step0Name";
import Step1Destination from "./steps/Step1Destination";
import Step2Travel      from "./steps/Step2Travel";
import Step3Travelers   from "./steps/Step3Travelers";
import Step4Contact     from "./steps/Step4Contact";
import Step5Review      from "./steps/Step5Review";

/* ── Data hooks — static imports (no top-level await) ── */
import { useCountriesList }    from "../../hooks/useCountriesList";
import { useDestinationsList } from "../../hooks/useDestinationsList";

/* ── Constants ── */
const HERO =
  "https://i.pinimg.com/1200x/c9/b9/bf/c9b9bf5b87a7ad8d09d900c681cd7214.jpg";

const ACCENT_GRADIENTS = [
  "from-emerald-300 via-green-400 to-teal-400",
  "from-green-400 via-emerald-400 to-cyan-400",
  "from-teal-400 via-green-400 to-emerald-500",
  "from-emerald-400 via-teal-400 to-green-500",
  "from-green-500 via-emerald-400 to-teal-300",
  "from-emerald-500 via-green-600 to-emerald-400",
];

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function Booking() {
  /* ── Responsive ── */
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    let raf;
    const h = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", h, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", h); };
  }, []);
  const isMobile = width < 640;

  /* ── Data — safe defaults if hooks not yet populated ── */
  const countriesResult    = useCountriesList?.()    || {};
  const destinationsResult = useDestinationsList?.() || {};
  const rawCountries    = countriesResult.data    || [];
  const rawDestinations = destinationsResult.data || [];

  const countriesList = useMemo(
    () => rawCountries.map(c => ({ value: String(c.id), label: c.name })),
    [rawCountries],
  );

  const destinationsList = useMemo(
    () => rawDestinations.map(d => ({
      value:     String(d.id),
      label:     d.name,
      countryId: d.country_id ? String(d.country_id) : undefined,
      country:   d.country_name || d.country || "",
    })),
    [rawDestinations],
  );

  /* ── Form state ── */
  const form = useBookingForm({ countriesList, destinationsList });

  /* ── ?destination= URL prefill ── */
  const [searchParams] = useSearchParams();
  const appliedRef = useRef(null);
  useEffect(() => {
    const slug = searchParams.get("destination");
    if (!slug || appliedRef.current === slug || !destinationsList.length) return;
    const match = destinationsList.find(
      d =>
        d.label.toLowerCase().replace(/\s+/g, "-") === slug ||
        String(d.value) === slug,
    );
    if (match) {
      appliedRef.current = slug;
      form.set("destinationId", match.value);
      if (match.countryId) form.set("countryId", match.countryId);
    }
  }, [searchParams, destinationsList]); // eslint-disable-line

  /* ── Step click handler (can only go back) ── */
  const handleStepClick = useCallback(
    (i) => { if (i < form.step) form.jumpTo(i); },
    [form],
  );

  /* ── Shared props for every step ── */
  const sharedProps = {
    data:            form.data,
    set:             form.set,
    touch:           form.touch,
    errors:          form.errors,
    touched:         form.touched,
    displayName:     form.displayName,
    onBack:          form.goBack,
    countriesList,
    destinationsList,
  };

  /* ── Render current step ── */
  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Name        {...sharedProps} onNext={form.tryNext} />;
      case 1: return <Step1Destination {...sharedProps} onNext={form.tryNext} />;
      case 2: return <Step2Travel      {...sharedProps} onNext={form.tryNext} />;
      case 3: return <Step3Travelers   {...sharedProps} onNext={form.tryNext} />;
      case 4: return (
        <Step4Contact
          {...sharedProps}
          onNext={form.tryNext}
          submitting={form.submitting}
        />
      );
      case 5: return (
        <Step5Review
          {...sharedProps}
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

  /* ══════════════════════════════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════════════════════════════ */
  if (form.submitted) {
    return (
      <>
        <PageHeader
          title="Booking Submitted!"
          subtitle="Your East African adventure is on its way."
          backgroundImage={HERO}
          breadcrumbs={[
            { label: "Booking", href: "/booking" },
            { label: "Confirmed" },
          ]}
        />
        <section
          className="relative min-h-[70vh] bg-gradient-to-br
                     from-emerald-50 via-white to-green-50
                     py-12 px-4 sm:px-6"
        >
          <StairBackground
            totalSteps={STEPS.length}
            currentStep={STEPS.length - 1}
          />
          <div className="relative z-10 max-w-2xl mx-auto">
            <SuccessScreen
              displayName={form.displayName}
              bookingRef={form.bookingRef}
              email={form.data.email}
              onReset={form.reset}
            />
            <TrustBadges isMobile={isMobile} />
          </div>
        </section>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     MAIN MULTI-STEP FORM
  ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <PageHeader
        title="Plan Your Safari"
        subtitle="Tell us about your dream — we'll handle everything else."
        backgroundImage={HERO}
        breadcrumbs={[{ label: "Booking" }]}
        height="360px"
      />

      <section
        className="relative min-h-screen overflow-hidden
                   bg-gradient-to-br from-emerald-50 via-white
                   to-green-50/70 py-10 px-4 sm:px-6 pb-24"
      >
        <StairBackground
          totalSteps={STEPS.length}
          currentStep={form.step}
        />

        <div className="relative z-10 max-w-2xl mx-auto">

          {/* WhatsApp banner */}
          <AnimatedSection animation="fadeInUp">
            <WhatsAppBanner />
          </AnimatedSection>

          {/* Progress stepper */}
          <AnimatedSection animation="fadeInUp" delay={0.05}>
            <ProgressBar
              currentStep={form.step}
              onStepClick={handleStepClick}
              isMobile={isMobile}
            />
          </AnimatedSection>

          {/* Form card */}
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <div
              className="bg-white/95 backdrop-blur-md rounded-3xl
                         shadow-xl shadow-emerald-100/40
                         border border-white/80 overflow-hidden"
            >
              {/* Animated top accent bar */}
              <div
                aria-hidden="true"
                className={`
                  h-1.5 w-full bg-gradient-to-r transition-all duration-500
                  ${ACCENT_GRADIENTS[form.step] || ACCENT_GRADIENTS[0]}
                `}
              />

              {/* Step label bar */}
              <div className="flex items-center justify-between px-6 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full bg-emerald-500
                               flex items-center justify-center
                               text-[11px] font-extrabold text-white"
                  >
                    {form.step + 1}
                  </span>
                  <span
                    className="text-xs font-bold text-emerald-600
                               uppercase tracking-wider"
                  >
                    {STEPS[form.step]?.label}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">
                  {form.step + 1} of {STEPS.length}
                </span>
              </div>

              {/* Step content */}
              <div className="p-6 sm:p-8 md:p-10 pt-6">
                <AnimatePresence mode="wait">
                  <React.Fragment key={form.step}>
                    {renderStep()}
                  </React.Fragment>
                </AnimatePresence>
              </div>
            </div>
          </AnimatedSection>

          {/* Step label below card */}
          <motion.p
            key={form.step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-gray-400 font-medium mt-4"
          >
            Step {form.step + 1} of {STEPS.length} ·{" "}
            <span className="text-emerald-500 font-bold">
              {STEPS[form.step]?.label}
            </span>
          </motion.p>

          {/* Trust badges */}
          <TrustBadges isMobile={isMobile} />
        </div>
      </section>
    </>
  );
}