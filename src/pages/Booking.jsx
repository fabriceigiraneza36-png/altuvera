/**
 * Booking.jsx — v6.0
 * ✅ Email link verification — no OTP codes
 * ✅ [object Object] fixed — safe error extraction everywhere
 * ✅ Preferences step removed (Trip → Travelers → Review → Contact)
 * ✅ Professional, responsive, accessible
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
import { useBookingWizard }  from "../hooks/useBookingWizard";
import { STEPS }             from "./Booking/BookingShared";

/* ── Constants ─────────────────────────────────────────────── */
const HERO_IMAGE =
  "https://i.pinimg.com/1200x/c9/b9/bf/c9b9bf5b87a7ad8d09d900c681cd7214.jpg";

const TRUST_ITEMS = [
  { icon: "🛡️", text: "Secure & Verified"    },
  { icon: "🏆", text: "Expert Guidance"       },
  { icon: "🎧", text: "24/7 WhatsApp Support" },
  { icon: "✈️", text: "Free Consultation"     },
];

const BG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ── Safe error message extractor ── */
const extractErrorMessage = (err) => {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    return (
      err.message ||
      err.error   ||
      err.msg     ||
      (err.errors
        ? (Array.isArray(err.errors)
            ? err.errors
                .map((e) => (typeof e === "string" ? e : e?.message ?? JSON.stringify(e)))
                .join(", ")
            : String(err.errors))
        : null) ||
      JSON.stringify(err)
    );
  }
  return String(err);
};

/* ── Loading Spinner ── */
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
      Loading booking details…
    </p>
  </div>
);

/* ── Error Banner ── */
const ErrorBanner = ({ error, onDismiss, onRetry, retryCount = 0 }) => {
  const message = extractErrorMessage(error);
  if (!message) return null;
  const canRetry = typeof onRetry === "function" && retryCount < 3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message.slice(0, 40)}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,   scale: 1    }}
        exit={{    opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        role="alert"
        aria-live="assertive"
        className="bk-info-box bk-info-box--red"
        style={{ marginBottom: 24, position: "relative" }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: "0 0 10px", fontWeight: 700,
            fontSize: 14.5, lineHeight: 1.5,
          }}>
            {message}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {canRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="bk-btn bk-btn--sm"
                style={{ background: "#dc2626", color: "#fff", borderRadius: 10 }}
              >
                🔄 Try Again
              </button>
            )}
            <a
              href="https://wa.me/250785751391"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#25D366", color: "#fff",
                borderRadius: 10, padding: "8px 16px",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
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
            position: "absolute", top: 12, right: 14,
            background: "transparent", border: "none",
            color: "#9ca3af", fontSize: 22,
            cursor: "pointer", padding: 0, lineHeight: 1,
          }}
        >×</button>
      </motion.div>
    </AnimatePresence>
  );
};

/* ── Step Validation Hint ── */
// Steps: 0=Trip, 1=Travelers, 2=Review, 3=Contact
const FIELD_GROUPS = [
  ["countryId", "destinationId", "startDate", "endDate", "flexibleMonths"],
  ["adults", "groupType"],
  [],
  ["firstName", "lastName", "email", "phone", "country", "agreeToTerms"],
];

const StepValidationHint = ({ currentStep, errors = {} }) => {
  const relevantErrors = useMemo(() => {
    const fields = FIELD_GROUPS[currentStep] || [];
    return fields
      .filter((f) => errors[f])
      .map((f) => extractErrorMessage(errors[f]))
      .filter(Boolean);
  }, [currentStep, errors]);

  if (!relevantErrors.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bk-info-box bk-info-box--amber"
      style={{ marginBottom: 16 }}
    >
      <span style={{ flexShrink: 0 }}>⚠️</span>
      <span>
        <strong>Please fix: </strong>
        {relevantErrors.slice(0, 2).join(" · ")}
        {relevantErrors.length > 2 && ` +${relevantErrors.length - 2} more`}
      </span>
    </motion.div>
  );
};

/* ── Success Screen ── */
const SuccessScreen = ({ isMobile, displayName, submissionRef, bookingEmail }) => (
  <div style={{ textAlign: "center" }}>
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        width: isMobile ? 90 : 110,
        height: isMobile ? 90 : 110,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#059669,#10b981)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 28px",
        boxShadow: "0 16px 48px rgba(5,150,105,.35)",
        fontSize: isMobile ? 42 : 52,
      }}
    >
      🎉
    </motion.div>

    <motion.h2
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{
        margin: "0 0 12px",
        fontSize: isMobile ? 24 : 30,
        fontWeight: 900, color: "#0f172a",
        fontFamily: "'Playfair Display', serif",
        letterSpacing: "-0.02em",
      }}
    >
      Booking Request Received!
    </motion.h2>

    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      style={{
        margin: "0 0 8px", color: "#6b7280",
        fontSize: isMobile ? 14 : 15.5,
        lineHeight: 1.7,
        maxWidth: 460, marginLeft: "auto", marginRight: "auto",
      }}
    >
      {displayName ? `Thank you, ${displayName}! ` : "Thank you! "}
      Your adventure request has been received.
    </motion.p>

    {submissionRef && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.28 }}
      >
        <p style={{
          margin: "16px 0 6px", fontSize: 11,
          color: "#9ca3af", fontWeight: 700,
          letterSpacing: "1.5px", textTransform: "uppercase",
        }}>
          Booking Reference
        </p>
        <div className="bk-success-ref">{submissionRef}</div>
      </motion.div>
    )}

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.34 }}
      className="bk-success-verify-box"
    >
      <span style={{ fontSize: 28, flexShrink: 0 }}>📧</span>
      <div>
        <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#1e40af", fontSize: 14.5 }}>
          One more step — verify your email
        </p>
        <p style={{ margin: 0, color: "#3b82f6", fontSize: 13.5, lineHeight: 1.6 }}>
          We've sent a <strong>confirmation link</strong> to{" "}
          {bookingEmail ? <strong>{bookingEmail}</strong> : "your email address"}.{" "}
          Click it to confirm your booking and notify our team.
          Check your spam folder if you don't see it within a few minutes.
        </p>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42 }}
      style={{
        display: "flex", gap: 12,
        justifyContent: "center", flexWrap: "wrap",
        marginBottom: 8,
      }}
    >
      <a
        href="https://wa.me/250785751391"
        target="_blank" rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#25D366", color: "#fff",
          borderRadius: 50, padding: "13px 24px",
          fontSize: 14, fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(37,211,102,.3)",
        }}
      >
        💬 Chat on WhatsApp
      </a>
      <a
        href="/"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#f9fafb", color: "#374151",
          border: "1.5px solid #e5e7eb",
          borderRadius: 50, padding: "13px 24px",
          fontSize: 14, fontWeight: 700,
          textDecoration: "none",
        }}
      >
        🏠 Back to Home
      </a>
    </motion.div>

    <p style={{ margin: "16px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
      Our team will contact you within 24 hours to discuss your itinerary.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
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
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const { isMobile, isTablet } = useMemo(() => ({
    isMobile: windowWidth < 640,
    isTablet: windowWidth >= 640 && windowWidth < 1024,
  }), [windowWidth]);

  const sectionPadding = useMemo(() =>
    isMobile ? "36px 14px 90px"
    : isTablet ? "48px 28px 110px"
    : "72px 32px 130px",
  [isMobile, isTablet]);

  const cardPadding = useMemo(() =>
    isMobile ? "28px 18px"
    : isTablet ? "44px 36px"
    : "56px 68px",
  [isMobile, isTablet]);

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
      wizardRef.current.handleSubmit?.();
    }
  }, []);

  const isLastStep = wizard.currentStep === STEPS.length - 1;

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
          padding: "70px 24px", backgroundColor: "#f0fdf4",
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
        <ConfettiCelebration active duration={5500} />
        <PageHeader
          title="Booking Submitted! 🎉"
          subtitle="Your adventure awaits!"
          backgroundImage={HERO_IMAGE}
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section style={{
          padding: isMobile ? "32px 14px 70px" : "60px 24px 100px",
          backgroundColor: "#f0fdf4",
          minHeight: "70vh", position: "relative",
        }}>
          <FloatingParticles />
          <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <GlassCard glow style={{ padding: isMobile ? "32px 20px" : "52px 56px" }}>
              <SuccessScreen
                isMobile={isMobile}
                displayName={wizard.displayName}
                submissionRef={wizard.submissionRef}
                bookingEmail={wizard.formData?.email}
              />
            </GlassCard>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <PageHeader
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage={HERO_IMAGE}
        breadcrumbs={[{ label: "Booking" }]}
        height="420px"
      />

      <section
        className="bk-section"
        style={{
          padding: sectionPadding,
          backgroundColor: "#f0fdf4",
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

        {/* Ambient blobs */}
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: -180, right: -180,
            width: 450, height: 450,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            background: "linear-gradient(135deg,rgba(5,150,105,.06),rgba(16,185,129,.03))",
            filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute", bottom: -130, left: -130,
            width: 380, height: 380,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background: "linear-gradient(135deg,rgba(16,185,129,.05),rgba(52,211,153,.02))",
            filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
          }}
        />

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
              {/* Global error */}
              <ErrorBanner
                error={wizard.submitError}
                onDismiss={handleDismissError}
                onRetry={handleRetrySubmit}
                retryCount={wizard.submitRetryCount ?? 0}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={wizard.currentStep}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: -24 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {/* Per-step validation hint */}
                  <AnimatePresence>
                    {wizard.errors && Object.keys(wizard.errors).length > 0 && (
                      <StepValidationHint
                        currentStep={wizard.currentStep}
                        errors={wizard.errors}
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
                        bookingId={wizard.submissionRef
                          ? undefined
                          : wizard.pendingBookingId}
                      />
                    )}
                  </form>
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <div style={{
              display: "flex", justifyContent: "center",
              alignItems: "center",
              gap: isMobile ? 14 : 36,
              marginTop: isMobile ? 28 : 48,
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
                    color: "#6b7280",
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                    padding: isMobile ? "5px 12px" : "7px 16px",
                    background: "rgba(255,255,255,0.75)",
                    borderRadius: 40,
                    border: "1px solid rgba(5,150,105,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span
                    style={{ fontSize: isMobile ? 15 : 17 }}
                    role="img" aria-label={item.text}
                  >
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