// src/pages/Booking/BookingWizard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ✅ All state lives in BookingShell (survives step navigation)
// ✅ This component is purely presentational — receives step as prop
// ✅ nextStep / prevStep navigate via React Router
// ✅ Shake animation on validation errors
// ─────────────────────────────────────────────────────────────────────────────
"use strict";

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate }       from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import GlobalStyles          from "./GlobalStyles";
import FloatingParticles     from "./components/FloatingParticles";
import GlassCard             from "./components/GlassCard";
import ConfettiCelebration   from "./components/ConfettiCelebration";
import ProgressStepper       from "./components/ProgressStepper";
import WhatsAppContactBanner from "./components/WhatsAppContactBanner";
import ResumeBanner          from "./components/ResumeBanner";
import BookingSteps          from "./BookingSteps";
import BookingContact        from "./BookingContact";
import SuccessScreen         from "./components/SuccessScreen";
import PageHeader            from "../../components/common/PageHeader";
import AnimatedSection       from "../../components/common/AnimatedSection";

import { useBookingCtx }            from "./BookingShell";
import { STEP_ROUTES, stepToPath }  from "./BookingRouter";

/* ── Constants ── */
const HERO_IMAGE =
  "https://i.pinimg.com/1200x/c9/b9/bf/c9b9bf5b87a7ad8d09d900c681cd7214.jpg";

const TRUST_ITEMS = [
  { icon: "🛡️", text: "Secure & Verified"  },
  { icon: "🏆", text: "Expert Guidance"     },
  { icon: "🎧", text: "24/7 Support"        },
  { icon: "✈️", text: "Free Consultation"   },
];

const BG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ── Helpers ── */
const extractMsg = (err) => {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object")
    return err.message || err.error || err.msg || JSON.stringify(err);
  return String(err);
};

/* ── Sub-components ── */
const LoadingSpinner = () => (
  <div style={{ textAlign: "center", padding: "80px 24px" }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{
        width: 52, height: 52, borderRadius: "50%",
        border: "4px solid #e5e7eb", borderTopColor: "#059669",
        margin: "0 auto 20px",
      }}
    />
    <p style={{ color: "#6b7280", fontSize: 15, fontWeight: 500, margin: 0 }}>
      Loading booking…
    </p>
  </div>
);

const ErrorBanner = ({ error, onDismiss, onRetry, retryCount = 0 }) => {
  const msg = extractMsg(error);
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: -10 }}
      role="alert"
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "16px 18px", marginBottom: 24,
        background: "#fef2f2", border: "1.5px solid #fca5a5",
        borderRadius: 14, position: "relative",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14, color: "#dc2626" }}>
          {msg}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {retryCount < 3 && onRetry && (
            <button
              type="button" onClick={onRetry}
              style={{
                padding: "7px 16px", borderRadius: 10, border: "none",
                background: "#dc2626", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >🔄 Try Again</button>
          )}
          <a
            href="https://wa.me/250788000000"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 10,
              background: "#25D366", color: "#fff",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}
          >💬 WhatsApp</a>
        </div>
      </div>
      <button
        type="button" onClick={onDismiss} aria-label="Dismiss"
        style={{
          position: "absolute", top: 10, right: 12,
          background: "none", border: "none",
          color: "#9ca3af", fontSize: 22, cursor: "pointer",
          lineHeight: 1, padding: 0,
        }}
      >×</button>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   BOOKING WIZARD — presentational, consumes BookingCtx
══════════════════════════════════════════════════════════════════════ */
const BookingWizard = ({ step: stepProp = 0, successMode = false }) => {
  const navigate    = useNavigate();
  const ctx         = useBookingCtx();

  const {
    formData, setFormData,
    errors,  setErrors,
    touched, setTouched,
    handleChange, handleBlur, handleInterestToggle,
    shake, triggerShake, validateStep,
    isSubmitting, submitError, setSubmitError,
    retryCount, submissionRef, bookingEmail,
    handleSubmit,
    showResume, setShowResume,
    handleResume, handleStartFresh,
    getTripDuration, getTotalVisitors,
    wizard, persistence,
  } = ctx;

  /* ── currentStep from prop ── */
  const currentStep = successMode ? -1 : stepProp;

  /* ── Responsive ── */
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWindowWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  const isMobile   = windowWidth < 640;
  const isTablet   = windowWidth >= 640 && windowWidth < 1024;
  const cardPad    = isMobile ? "24px 16px" : isTablet ? "40px 32px" : "52px 64px";
  const sectionPad = isMobile ? "32px 14px 80px" : isTablet ? "44px 24px 100px" : "64px 32px 120px";

  /* ── Navigation ── */
  const goToStep = useCallback((targetStep) => {
    const slug = stepToPath(targetStep);
    navigate(`/booking/${slug}`);
    persistence.setCurrentStep?.(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, persistence]);

  const nextStep = useCallback(() => {
    console.log("[BookingWizard] nextStep — currentStep:", currentStep);
    const errs = validateStep(currentStep, formData);
    console.log("[BookingWizard] errors:", errs);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(Object.fromEntries(Object.keys(errs).map((k) => [k, true])));
      triggerShake();
      /* Scroll to first error */
      requestAnimationFrame(() => {
        const el = document.querySelector("[role='alert']");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setErrors({});
    setTouched({});
    goToStep(currentStep + 1);
  }, [currentStep, formData, validateStep, setErrors, setTouched, triggerShake, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleStepClick = useCallback((targetStep) => {
    if (targetStep <= currentStep) { goToStep(targetStep); return; }
    for (let s = currentStep; s < targetStep; s++) {
      const errs = validateStep(s, formData);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setTouched(Object.fromEntries(Object.keys(errs).map((k) => [k, true])));
        triggerShake();
        return;
      }
    }
    goToStep(targetStep);
  }, [currentStep, formData, validateStep, setErrors, setTouched, triggerShake, goToStep]);

  /* ── Derived ── */
  const isSuccessView = successMode || currentStep === -1;
  const isContactStep = currentStep === 3;
  const isStepsView   = currentStep >= 0 && currentStep <= 2;
  const STEPS_META    = STEP_ROUTES.map((r) => ({ label: r.label }));

  /* ════════ LOADING ════════ */
  if (wizard.loadingData) {
    return (
      <>
        <GlobalStyles />
        <PageHeader
          title="Book Your Adventure"
          subtitle="Start planning your East African adventure today."
          backgroundImage={HERO_IMAGE}
          breadcrumbs={[{ label: "Booking" }]}
          height="380px"
        />
        <section style={{
          padding: "70px 24px", backgroundColor: "#f0fdf4",
          minHeight: "60vh", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <LoadingSpinner />
        </section>
      </>
    );
  }

  /* ════════ SUCCESS ════════ */
  if (isSuccessView) {
    return (
      <>
        <GlobalStyles />
        <ConfettiCelebration active duration={5500} />
        <PageHeader
          title="Booking Submitted! 🎉"
          subtitle="Your adventure awaits!"
          backgroundImage={HERO_IMAGE}
          breadcrumbs={[{ label: "Booking" }, { label: "Success" }]}
          height="320px"
        />
        <section style={{
          padding: isMobile ? "28px 14px 60px" : "52px 24px 90px",
          backgroundColor: "#f0fdf4",
          minHeight: "70vh", position: "relative",
        }}>
          <FloatingParticles />
          <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <GlassCard glow style={{ padding: isMobile ? "28px 18px" : "48px 52px" }}>
              <SuccessScreen
                isMobile={isMobile}
                displayName={wizard.displayName}
                submissionRef={submissionRef || wizard.submissionRef}
                bookingEmail={bookingEmail || formData.email}
              />
            </GlassCard>
          </div>
        </section>
      </>
    );
  }

  /* ════════ MAIN ════════ */
  return (
    <>
      <GlobalStyles />
      <PageHeader
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage={HERO_IMAGE}
        breadcrumbs={[
          { label: "Booking", href: "/booking" },
          { label: STEP_ROUTES[currentStep]?.label ?? "Details" },
        ]}
        height="380px"
      />

      <section style={{
        padding: sectionPad,
        backgroundColor: "#f0fdf4",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: BG_PATTERN,
          pointerEvents: "none", zIndex: 0,
        }} />
        <FloatingParticles />
        <motion.div aria-hidden="true"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: -180, right: -180,
            width: 450, height: 450,
            borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
            background: "linear-gradient(135deg,rgba(5,150,105,.06),rgba(16,185,129,.03))",
            filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
          }}
        />
        <motion.div aria-hidden="true"
          animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute", bottom: -130, left: -130,
            width: 380, height: 380,
            borderRadius: "40% 60% 70% 30%/40% 50% 60% 50%",
            background: "linear-gradient(135deg,rgba(16,185,129,.05),rgba(52,211,153,.02))",
            filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1020, margin: "0 auto", position: "relative", zIndex: 1 }}>

          <AnimatedSection animation="fadeInUp">
            <WhatsAppContactBanner isMobile={isMobile} />
          </AnimatedSection>

          {/* Resume banner */}
          <AnimatePresence>
            {showResume && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{    opacity: 0, height: 0    }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden", marginBottom: 16 }}
              >
                <ResumeBanner
                  savedAt={persistence.savedAt}
                  step={persistence.currentStep}
                  stepLabel={STEP_ROUTES[persistence.currentStep ?? 0]?.label}
                  onResume={() => handleResume(navigate)}
                  onStartFresh={() => handleStartFresh(navigate)}
                  isMobile={isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress stepper */}
          <AnimatedSection animation="fadeInUp" delay={0.05}>
            <ProgressStepper
              steps={STEPS_META}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              isMobile={isMobile}
            />
          </AnimatedSection>

          {/* Main card — shake on validation error */}
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <motion.div
              animate={shake ? { x: [-10, 10, -8, 8, -5, 5, -2, 2, 0] } : { x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <GlassCard glow style={{ padding: cardPad }}>

                <AnimatePresence>
                  {submitError && (
                    <ErrorBanner
                      error={submitError}
                      onDismiss={() => setSubmitError(null)}
                      onRetry={() => { setSubmitError(null); handleSubmit(navigate); }}
                      retryCount={retryCount}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`wizard-step-${currentStep}`}
                    initial={{ opacity: 0, x: 40  }}
                    animate={{ opacity: 1, x: 0   }}
                    exit={{    opacity: 0, x: -40 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isContactStep) handleSubmit(navigate);
                        else nextStep();
                      }}
                      noValidate
                    >
                      {/* Steps 0, 1, 2 */}
                      {isStepsView && (
                        <BookingSteps
                          currentStep={currentStep}
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          touched={touched}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          isMobile={isMobile}
                          isTablet={isTablet}
                          displayName={wizard.displayName}
                          categoriesList={wizard.categoriesList    || []}
                          destinationsList={wizard.destinationsList || []}
                          countriesList={wizard.countriesList      || []}
                          servicesData={wizard.servicesData        || []}
                          getTripDuration={getTripDuration}
                          groupTypes={wizard.groupTypes            || []}
                          accommodationTypes={wizard.accommodationTypes || []}
                          getTotalVisitors={getTotalVisitors}
                          interests={wizard.interests              || []}
                          handleInterestToggle={handleInterestToggle}
                          nextStep={nextStep}
                          prevStep={prevStep}
                          handleStepClick={handleStepClick}
                          isSubmitting={isSubmitting}
                        />
                      )}

                      {/* Step 3 — Contact */}
                      {isContactStep && (
                        <BookingContact
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          touched={touched}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          getTripDuration={getTripDuration}
                          getTotalVisitors={getTotalVisitors}
                          getDestinationName={wizard.getDestinationName}
                          accommodationTypes={wizard.accommodationTypes || []}
                          user={wizard.user}
                          displayName={wizard.displayName}
                          isAuthenticated={wizard.isAuthenticated}
                          openModal={wizard.openModal}
                          isSubmitting={isSubmitting}
                          onSubmit={() => handleSubmit(navigate)}
                          prevStep={prevStep}
                          isMobile={isMobile}
                          submitError={submitError}
                          destinationsList={wizard.destinationsList || []}
                          groupTypes={wizard.groupTypes            || []}
                          countriesList={wizard.countriesList      || []}
                        />
                      )}
                    </form>
                  </motion.div>
                </AnimatePresence>

              </GlassCard>
            </motion.div>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              gap: isMobile ? 12 : 32, marginTop: isMobile ? 24 : 40,
              flexWrap: "wrap",
            }}>
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    color: "#6b7280", fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                    padding: isMobile ? "5px 12px" : "7px 16px",
                    background: "rgba(255,255,255,0.75)",
                    borderRadius: 40,
                    border: "1px solid rgba(5,150,105,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span role="img" aria-label={item.text}
                    style={{ fontSize: isMobile ? 15 : 17 }}>
                    {item.icon}
                  </span>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

        </div>
      </section>
    </>
  );
};

export default BookingWizard;