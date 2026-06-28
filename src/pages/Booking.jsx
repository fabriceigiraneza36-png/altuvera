/**
 * Booking.jsx — Main booking page v3.0
 * Full integration, error handling, responsive, professional
 */

import React, {
  useState, useEffect, useMemo, useCallback, useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import PageHeader            from "../components/common/PageHeader";
import AnimatedSection       from "../components/common/AnimatedSection";
import BookingSteps          from "./Booking/BookingSteps";
import BookingContact        from "./Booking/BookingContact";
import GlobalStyles          from "./Booking/GlobalStyles";
import FloatingParticles     from "./Booking/components/FloatingParticles";
import GlassCard             from "./Booking/components/GlassCard";
import ConfettiCelebration   from "./Booking/components/ConfettiCelebration";
import ProgressStepper       from "./Booking/components/ProgressStepper";
import WhatsAppContactBanner from "./Booking/components/WhatsAppContactBanner";
import SuccessScreen         from "./Booking/components/SuccessScreen";
import { useBookingWizard }  from "../hooks/useBookingWizard";
import { STEPS }             from "./Booking/BookingShared";

/* ── Constants ──────────────────────────────────────────────── */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80";

const TRUST_ITEMS = [
  { icon: "🛡️", text: "Secure & Verified"    },
  { icon: "🏆", text: "Expert Guidance"       },
  { icon: "🎧", text: "24/7 WhatsApp Support" },
];

const BG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* Stable blob configs */
const BLOB_1 = {
  animate:    { scale: [1, 1.08, 1], rotate: [0, 4, 0] },
  transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  style: {
    position: "absolute", top: -180, right: -180,
    width: 450, height: 450,
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    background: "linear-gradient(135deg,rgba(5,150,105,.06),rgba(16,185,129,.03))",
    filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
  },
}

const BLOB_2 = {
  animate:    { scale: [1, 1.12, 1], rotate: [0, -4, 0] },
  transition: { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 },
  style: {
    position: "absolute", bottom: -130, left: -130,
    width: 380, height: 380,
    borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
    background: "linear-gradient(135deg,rgba(16,185,129,.05),rgba(52,211,153,.02))",
    filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
  },
}

/* ── Loading Spinner ─────────────────────────────────────────── */
const LoadingSpinner = () => (
  <div style={{ textAlign: "center", padding: "60px 24px" }}>
    <div style={{
      width: 52, height: 52, borderRadius: "50%",
      border: "4px solid #E5E7EB", borderTopColor: "#059669",
      animation: "bk-spin 1.1s linear infinite",
      margin: "0 auto 18px",
    }} />
    <p style={{ color: "#6B7280", fontSize: 15, fontWeight: 500, margin: 0 }}>
      Loading booking details…
    </p>
  </div>
);

/* ── Error Banner ────────────────────────────────────────────── */
const ErrorBanner = ({ error, onDismiss, onRetry, retryCount }) => {
  if (!error) return null;
  const canRetry = typeof onRetry === "function" && retryCount < 3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`err-${String(error).slice(0, 40)}`}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,   scale: 1    }}
        exit={{    opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="alert"
        aria-live="assertive"
        style={{
          background: "#FEF2F2", border: "1.5px solid #FECACA",
          borderRadius: 16, padding: "16px 18px", marginBottom: 24,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>⚠️</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: "0 0 10px", fontWeight: 700,
            color: "#991B1B", fontSize: 15, lineHeight: 1.4,
          }}>
            {error}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {canRetry && (
              <button
                type="button" onClick={onRetry}
                style={{
                  background: "#DC2626", color: "#fff",
                  border: "none", borderRadius: 8,
                  padding: "7px 16px", fontSize: 13,
                  fontWeight: 700, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                🔄 Try Again
              </button>
            )}
            <a
              href="https://wa.me/250788000000"
              target="_blank" rel="noopener noreferrer"
              style={{
                background: "#25D366", color: "#fff",
                borderRadius: 8, padding: "7px 16px",
                fontSize: 13, fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              💬 WhatsApp Support
            </a>
          </div>
        </div>
        <button
          type="button" onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: "transparent", border: "none",
            color: "#9CA3AF", fontSize: 22,
            cursor: "pointer", padding: "0 4px",
            lineHeight: 1, flexShrink: 0,
          }}
        >×</button>
      </motion.div>
    </AnimatePresence>
  );
};

/* ── Step validation status indicator ───────────────────────── */
const StepValidationHint = ({ currentStep, wizard }) => {
  const stepKeys = ["trip", "travelers", "preferences", "review", "contact"];
  const currentKey = stepKeys[currentStep];
  const stepErrors = wizard.errors || {};

  const relevantErrors = useMemo(() => {
    const fieldGroups = {
      trip:        ["destinationId", "countryId", "startDate", "endDate", "flexibleMonths"],
      travelers:   ["adults", "groupType"],
      preferences: ["accommodationType", "budgetRange"],
      review:      [],
      contact:     ["firstName", "lastName", "email", "phone", "agreeToTerms"],
    };
    const fields = fieldGroups[currentKey] || [];
    return fields.filter(f => stepErrors[f]).map(f => stepErrors[f]);
  }, [currentKey, stepErrors]);

  if (!relevantErrors.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        background: "#FEF2F2", border: "1px solid #FECACA",
        borderRadius: 12, padding: "10px 16px", marginBottom: 16,
        fontSize: 13, color: "#991B1B", lineHeight: 1.5,
      }}
    >
      <strong>⚠️ Please fix:</strong>{" "}
      {relevantErrors.slice(0, 2).join(" · ")}
      {relevantErrors.length > 2 && ` +${relevantErrors.length - 2} more`}
    </motion.div>
  );
};

/* ── Main Booking Component ──────────────────────────────────── */
const Booking = () => {
  const wizard = useBookingWizard();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    let rafId;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (typeof window !== "undefined") setWindowWidth(window.innerWidth);
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);

  const { isMobile, isTablet } = useMemo(() => ({
    isMobile: windowWidth < 640,
    isTablet: windowWidth >= 640 && windowWidth < 1024,
  }), [windowWidth]);

  const sectionPadding = useMemo(() =>
    isMobile ? "36px 14px 90px"
    : isTablet ? "48px 24px 110px"
    : "72px 24px 130px",
  [isMobile, isTablet]);

  const cardPadding = useMemo(() =>
    isMobile ? "24px 18px"
    : isTablet ? "40px 32px"
    : "52px 64px",
  [isMobile, isTablet]);

  /* Stable refs to wizard fns */
  const wizardRef = useRef(wizard);
  useEffect(() => { wizardRef.current = wizard; });

  const handleDismissError = useCallback(() => {
    wizardRef.current.setSubmitError?.(null);
  }, []);

  const handleRetrySubmit = useCallback(() => {
    wizardRef.current.setSubmitError?.(null);
    wizardRef.current.handleSubmit?.();
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (wizardRef.current.currentStep === STEPS.length - 1) {
      wizardRef.current.handleSubmit(e);
    }
  }, []);

  /* ── Loading ── */
  if (wizard.loadingData) {
    return (
      <>
        <GlobalStyles />
        <PageHeader
          title="Book Your Adventure"
          subtitle="Start planning your East African adventure today."
          backgroundImage={HERO_IMAGE}
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section style={{
          padding: "70px 24px", backgroundColor: "#F0FDF4",
          minHeight: "60vh", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <LoadingSpinner />
        </section>
      </>
    );
  }

  /* ── Success ── */
  if (wizard.isSubmitted) {
    return (
      <>
        <GlobalStyles />
        <ConfettiCelebration active duration={5000} />
        <PageHeader
          title="Booking Submitted! 🎉"
          subtitle="Your adventure awaits!"
          backgroundImage={HERO_IMAGE}
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section style={{
          padding: isMobile ? "28px 14px 70px" : "56px 24px 100px",
          backgroundColor: "#F0FDF4",
          minHeight: "70vh", position: "relative",
        }}>
          <FloatingParticles />
          <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <GlassCard glow style={{ padding: isMobile ? "28px 20px" : "48px 52px" }}>
              <SuccessScreen
                isMobile={isMobile}
                displayName={wizard.displayName}
                submissionRef={wizard.submissionRef}
              />
            </GlassCard>
          </div>
        </section>
      </>
    );
  }

  /* ── Main form ── */
  const isLastStep = wizard.currentStep === STEPS.length - 1;

  return (
    <>
      <GlobalStyles />

      <PageHeader
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage={HERO_IMAGE}
        breadcrumbs={[{ label: "Booking" }]}
        height="400px"
      />

      <section
        className="bk-section"
        style={{
          padding: sectionPadding,
          backgroundColor: "#F0FDF4",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG pattern */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: BG_PATTERN,
          pointerEvents: "none", zIndex: 0,
        }} />

        <FloatingParticles />

        {/* Decorative blobs */}
        <motion.div aria-hidden="true"
          animate={BLOB_1.animate} transition={BLOB_1.transition} style={BLOB_1.style} />
        <motion.div aria-hidden="true"
          animate={BLOB_2.animate} transition={BLOB_2.transition} style={BLOB_2.style} />

        {/* Content */}
        <div style={{ maxWidth: 1020, margin: "0 auto", position: "relative", zIndex: 1 }}>

          <AnimatedSection animation="fadeInUp">
            <WhatsAppContactBanner isMobile={isMobile} />
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp" delay={0.05}>
            <ProgressStepper
              steps={STEPS}
              currentStep={wizard.currentStep}
              onStepClick={wizard.handleStepClick}
              isMobile={isMobile}
            />
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <GlassCard
              glow
              style={{
                padding: cardPadding,
                opacity:   wizard.isAnimating ? 0 : 1,
                transform: wizard.isAnimating ? "translateY(12px)" : "translateY(0)",
                transition: "opacity .22s ease, transform .22s ease",
              }}
            >
              {/* Global error banner */}
              <ErrorBanner
                error={wizard.submitError}
                onDismiss={handleDismissError}
                onRetry={handleRetrySubmit}
                retryCount={wizard.submitRetryCount ?? 0}
              />

              {/* Step validation hint */}
              <AnimatePresence>
                {wizard.errors && Object.keys(wizard.errors).length > 0 && (
                  <StepValidationHint
                    currentStep={wizard.currentStep}
                    wizard={wizard}
                  />
                )}
              </AnimatePresence>

              <form onSubmit={handleFormSubmit} noValidate>
                {!isLastStep ? (
                  <BookingSteps
                    currentStep={wizard.currentStep}
                    isAnimating={wizard.isAnimating}
                    formData={wizard.formData}
                    setFormData={wizard.setFormData}
                    errors={wizard.errors}
                    touched={wizard.touched}
                    handleChange={wizard.handleChange}
                    handleBlur={wizard.handleBlur}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    displayName={wizard.displayName}
                    categoriesList={wizard.categoriesList}
                    destinationsList={wizard.destinationsList}
                    countriesList={wizard.countriesList}
                    servicesData={wizard.servicesData}
                    getTripDuration={wizard.getTripDuration}
                    groupTypes={wizard.groupTypes}
                    accommodationTypes={wizard.accommodationTypes}
                    getTotalVisitors={wizard.getTotalVisitors}
                    interests={wizard.interests}
                    handleInterestToggle={wizard.handleInterestToggle}
                    nextStep={wizard.nextStep}
                    prevStep={wizard.prevStep}
                    handleStepClick={wizard.handleStepClick}
                    isSubmitting={wizard.isSubmitting}
                    handleSubmit={wizard.handleSubmit}
                  />
                ) : (
                  <BookingContact
                    isSubmitted={wizard.isSubmitted}
                    formData={wizard.formData}
                    setFormData={wizard.setFormData}
                    errors={wizard.errors}
                    touched={wizard.touched}
                    handleChange={wizard.handleChange}
                    handleBlur={wizard.handleBlur}
                    getTripDuration={wizard.getTripDuration}
                    getTotalVisitors={wizard.getTotalVisitors}
                    getDestinationName={wizard.getDestinationName}
                    accommodationTypes={wizard.accommodationTypes}
                    user={wizard.user}
                    displayName={wizard.displayName}
                    isAuthenticated={wizard.isAuthenticated}
                    openModal={wizard.openModal}
                    isSubmitting={wizard.isSubmitting}
                    onSubmit={wizard.handleSubmit}
                    prevStep={wizard.prevStep}
                    isMobile={isMobile}
                    submitError={wizard.submitError}
                    destinationsList={wizard.destinationsList}
                    groupTypes={wizard.groupTypes}
                    countriesList={wizard.countriesList}
                  />
                )}
              </form>
            </GlassCard>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <div style={{
              display: "flex", justifyContent: "center",
              alignItems: "center",
              gap: isMobile ? 18 : 44,
              marginTop: isMobile ? 32 : 48,
              flexWrap: "wrap",
            }}>
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.09 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    color: "#6B7280",
                    fontSize: isMobile ? 12 : 13.5,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: 18 }} role="img" aria-label={item.text}>
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

export default Booking;