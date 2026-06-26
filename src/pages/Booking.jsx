/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOKING PAGE v2.1
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Changes from v2.0:
 *   - useBookingWizard now uses useSafeReduxAuth (no Provider crash)
 *   - Button click flow audited: nextStep validates then advances
 *   - handleSubmit guard prevents double-submit
 *   - handleDismissError / handleRetrySubmit use stable refs (no stale closure)
 *   - isMobile/isTablet derived inside useMemo (single source of truth)
 *   - ErrorBanner key prop fixed for AnimatePresence remount
 *   - Form onSubmit only fires on step 4 (steps 1-3 use nextStep)
 *   - All wizard prop references verified against hook return shape
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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

import { useBookingWizard } from "../hooks/useBookingWizard";
import { STEPS }            from "./Booking/BookingShared";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80";

const TRUST_ITEMS = [
  { icon: "🛡️", text: "Secure & Verified"    },
  { icon: "🏆", text: "Expert Guidance"       },
  { icon: "🎧", text: "24/7 WhatsApp Support" },
];

const BG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// ─────────────────────────────────────────────────────────────────────────────
// Decorative blob configs (stable — defined outside component)
// ─────────────────────────────────────────────────────────────────────────────

const BLOB_1_ANIMATE    = { scale: [1, 1.08, 1], rotate: [0, 4, 0] };
const BLOB_1_TRANSITION = { duration: 18, repeat: Infinity, ease: "easeInOut" };
const BLOB_1_STYLE      = {
  position:     "absolute",
  top:          -180,
  right:        -180,
  width:        450,
  height:       450,
  borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
  background:   "linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,185,129,0.03))",
  filter:       "blur(50px)",
  pointerEvents:"none",
  zIndex:       0,
};

const BLOB_2_ANIMATE    = { scale: [1, 1.12, 1], rotate: [0, -4, 0] };
const BLOB_2_TRANSITION = { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 };
const BLOB_2_STYLE      = {
  position:     "absolute",
  bottom:       -130,
  left:         -130,
  width:        380,
  height:       380,
  borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
  background:   "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(52,211,153,0.02))",
  filter:       "blur(50px)",
  pointerEvents:"none",
  zIndex:       0,
};

// ─────────────────────────────────────────────────────────────────────────────
// ErrorBanner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inline error banner shown above the form when submission fails.
 * - Dismissed via × button
 * - "Try Again" only shown for retry count < 3
 * - Always shows WhatsApp fallback link
 */
const ErrorBanner = ({ error, onDismiss, onRetry, retryCount }) => {
  if (!error) return null;

  const canRetry = typeof onRetry === "function" && retryCount < 3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        // Key changes whenever the error message changes so AnimatePresence
        // correctly unmounts/remounts the banner.
        key={`err-${String(error).slice(0, 40)}`}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,   scale: 1    }}
        exit={{    opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="alert"
        aria-live="assertive"
        style={{
          background:   "#FEF2F2",
          border:       "1.5px solid #FECACA",
          borderRadius: 16,
          padding:      "16px 18px",
          marginBottom: 24,
          display:      "flex",
          gap:          12,
          alignItems:   "flex-start",
        }}
      >
        {/* Warning icon */}
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>⚠️</span>

        {/* Message + actions */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin:     "0 0 8px",
              fontWeight: 700,
              color:      "#991B1B",
              fontSize:   15,
              lineHeight: 1.4,
            }}
          >
            {error}
          </p>

          <div
            style={{
              display:  "flex",
              gap:      10,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {canRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  background:   "#DC2626",
                  color:        "#fff",
                  border:       "none",
                  borderRadius: 8,
                  padding:      "6px 14px",
                  fontSize:     13,
                  fontWeight:   600,
                  cursor:       "pointer",
                }}
              >
                Try Again
              </button>
            )}

            <a
              href="https://wa.me/250788000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background:     "#25D366",
                color:          "#fff",
                borderRadius:   8,
                padding:        "6px 14px",
                fontSize:       13,
                fontWeight:     600,
                textDecoration: "none",
                display:        "inline-flex",
                alignItems:     "center",
                gap:            5,
              }}
            >
              💬 Contact on WhatsApp
            </a>
          </div>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: "transparent",
            border:     "none",
            color:      "#9CA3AF",
            fontSize:   20,
            cursor:     "pointer",
            padding:    "0 4px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LoadingSpinner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure-CSS spinner — no Framer Motion dependency.
 */
const LoadingSpinner = () => (
  <div style={{ textAlign: "center" }}>
    <style>{`
      @keyframes bk-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `}</style>
    <div
      style={{
        width:          52,
        height:         52,
        borderRadius:   "50%",
        border:         "4px solid #E5E7EB",
        borderTopColor: "#059669",
        animation:      "bk-spin 1.1s linear infinite",
        margin:         "0 auto 16px",
      }}
    />
    <p style={{ color: "#6B7280", fontSize: 15, fontWeight: 500, margin: 0 }}>
      Loading booking details…
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Booking — main component
// ─────────────────────────────────────────────────────────────────────────────

const Booking = () => {
  // ── Wizard hook (safe — won't throw outside Redux Provider) ───────────────
  const wizard = useBookingWizard();

  // ── Window width for responsive layout ────────────────────────────────────
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

  // ── Responsive flags ───────────────────────────────────────────────────────
  const { isMobile, isTablet } = useMemo(() => ({
    isMobile: windowWidth < 640,
    isTablet: windowWidth >= 640 && windowWidth < 1024,
  }), [windowWidth]);

  // ── Layout values ──────────────────────────────────────────────────────────
  const sectionPadding = useMemo(
    () =>
      isMobile ? "40px 16px 100px"
      : isTablet ? "50px 24px 120px"
      : "80px 24px 140px",
    [isMobile, isTablet],
  );

  const cardPadding = useMemo(
    () =>
      isMobile ? "28px 20px"
      : isTablet ? "44px 34px"
      : "54px 68px",
    [isMobile, isTablet],
  );

  // ── Stable refs to wizard functions (prevent stale closures in callbacks) ──
  // We store the latest versions in refs so that useCallback deps stay minimal
  // while always calling the most-current implementation.
  const wizardRef = useRef(wizard);
  useEffect(() => { wizardRef.current = wizard; });

  // ── Dismiss error ──────────────────────────────────────────────────────────
  const handleDismissError = useCallback(() => {
    wizardRef.current.setSubmitError(null);
  }, []);

  // ── Retry submit ───────────────────────────────────────────────────────────
  const handleRetrySubmit = useCallback(() => {
    wizardRef.current.setSubmitError(null);
    wizardRef.current.handleSubmit();
  }, []);

  // ── Form submit handler (only reached on step 4) ───────────────────────────
  // Steps 1-3 call wizard.nextStep() from within BookingSteps — the <form>
  // onSubmit is only the final "Book Now" action.
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    // Only submit if we are on the final step; earlier steps should never
    // reach here because their buttons are type="button", not type="submit".
    if (wizardRef.current.currentStep === STEPS.length) {
      wizardRef.current.handleSubmit(e);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════

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
        <section
          style={{
            padding:         "70px 24px",
            backgroundColor: "#F0FDF4",
            minHeight:       "60vh",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}
        >
          <LoadingSpinner />
        </section>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUCCESS STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (wizard.isSubmitted) {
    return (
      <>
        <GlobalStyles />
        <ConfettiCelebration active duration={5000} />
        <PageHeader
          title="Booking Submitted!"
          subtitle="Your adventure awaits!"
          backgroundImage={HERO_IMAGE}
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding:         isMobile ? "30px 16px 75px" : "60px 24px 100px",
            backgroundColor: "#F0FDF4",
            minHeight:       "70vh",
            position:        "relative",
          }}
        >
          <FloatingParticles />
          <div
            style={{
              maxWidth: 760,
              margin:   "0 auto",
              position: "relative",
              zIndex:   1,
            }}
          >
            <GlassCard
              glow
              style={{ padding: isMobile ? "28px 22px" : "44px 52px" }}
            >
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

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN BOOKING FORM
  // ═══════════════════════════════════════════════════════════════════════════

  const isLastStep = wizard.currentStep === STEPS.length;

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
          padding:         sectionPadding,
          backgroundColor: "#F0FDF4",
          minHeight:       "100vh",
          position:        "relative",
          overflow:        "hidden",
        }}
      >
        {/* ── Background pattern ── */}
        <div
          aria-hidden="true"
          style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: BG_PATTERN,
            pointerEvents:   "none",
            zIndex:          0,
          }}
        />

        <FloatingParticles />

        {/* ── Decorative blobs ── */}
        <motion.div
          aria-hidden="true"
          animate={BLOB_1_ANIMATE}
          transition={BLOB_1_TRANSITION}
          style={BLOB_1_STYLE}
        />
        <motion.div
          aria-hidden="true"
          animate={BLOB_2_ANIMATE}
          transition={BLOB_2_TRANSITION}
          style={BLOB_2_STYLE}
        />

        {/* ── Content column ── */}
        <div
          style={{
            maxWidth: 1000,
            margin:   "0 auto",
            position: "relative",
            zIndex:   1,
          }}
        >
          {/* WhatsApp Banner */}
          <AnimatedSection animation="fadeInUp">
            <WhatsAppContactBanner isMobile={isMobile} />
          </AnimatedSection>

          {/* Progress Stepper */}
          <AnimatedSection animation="fadeInUp" delay={0.05}>
            <ProgressStepper
              steps={STEPS}
              currentStep={wizard.currentStep}
              onStepClick={wizard.handleStepClick}
              isMobile={isMobile}
            />
          </AnimatedSection>

          {/* Form Card */}
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <GlassCard
              glow
              style={{
                padding:    cardPadding,
                // Smooth fade while wizard animates between steps
                opacity:    wizard.isAnimating ? 0            : 1,
                transform:  wizard.isAnimating ? "translateY(14px)" : "translateY(0)",
                transition: "opacity 0.22s ease, transform 0.22s ease",
              }}
            >
              {/* Error Banner — sits above the form fields */}
              <ErrorBanner
                error={wizard.submitError}
                onDismiss={handleDismissError}
                onRetry={handleRetrySubmit}
                retryCount={wizard.submitRetryCount ?? 0}
              />

              {/*
               * The <form> wraps everything so that pressing Enter in a text
               * field on the last step triggers submission.  On steps 1-3,
               * all action buttons must be type="button" (enforced in
               * BookingSteps) to prevent accidental early submission.
               */}
              <form onSubmit={handleFormSubmit} noValidate>
                {!isLastStep ? (
                  // ── Steps 1-3 ───────────────────────────────────────────
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
                  // ── Step 4 — Contact & Submit ────────────────────────────
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
                  />
                )}
              </form>
            </GlassCard>
          </AnimatedSection>

          {/* Trust Badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <div
              style={{
                display:        "flex",
                justifyContent: "center",
                alignItems:     "center",
                gap:            isMobile ? 20 : 48,
                marginTop:      isMobile ? 36 : 52,
                flexWrap:       "wrap",
              }}
            >
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.35 + i * 0.09 }}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        8,
                    color:      "#6B7280",
                    fontSize:   isMobile ? 12 : 14,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{ fontSize: 20 }}
                    role="img"
                    aria-label={item.text}
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