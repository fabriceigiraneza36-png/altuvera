// src/pages/Booking/BookingWizard.jsx — FIXED
import React, {
  useState, useEffect, useMemo, useCallback, useRef,
} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

import { useBookingPersistence }     from "../../hooks/useBookingPersistence";
import { useBookingWizard }          from "../../hooks/useBookingWizard";
import { STEP_ROUTES, stepToPath, pathToStep } from "./BookingRouter";

const HERO_IMAGE =
  "https://i.pinimg.com/1200x/c9/b9/bf/c9b9bf5b87a7ad8d09d900c681cd7214.jpg";

const TRUST_ITEMS = [
  { icon: "🛡️", text: "Secure & Verified"    },
  { icon: "🏆", text: "Expert Guidance"       },
  { icon: "🎧", text: "24/7 Support"          },
  { icon: "✈️", text: "Free Consultation"     },
];

const BG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ── Safe error extractor ── */
const extractMsg = (err) => {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object")
    return err.message || err.error || err.msg || JSON.stringify(err);
  return String(err);
};

/* ── Per-step validation ── */
function validateStep(step, formData) {
  const errors = {};

  if (step === 0) {
    if (!formData.countryId)
      errors.countryId = "Please select a country";
    if (!formData.isFlexible && !formData.startDate)
      errors.startDate = "Please select a departure date";
    if (formData.isFlexible && !(formData.flexibleMonths || []).length)
      errors.flexibleMonths = "Please select at least one month";
  }

  if (step === 1) {
    if (!formData.adults || parseInt(formData.adults, 10) < 1)
      errors.adults = "At least 1 adult is required";
    if (!formData.groupType)
      errors.groupType = "Please select a group type";
  }

  if (step === 3) {
    if (!formData.firstName?.trim())
      errors.firstName = "First name is required";
    if (!formData.lastName?.trim())
      errors.lastName = "Last name is required";
    if (!formData.email?.trim())
      errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please enter a valid email address";
    if (!formData.phone?.trim())
      errors.phone = "Phone number is required";
    if (!formData.country?.trim())
      errors.country = "Your country is required";
    if (!formData.agreeToTerms)
      errors.agreeToTerms = "You must agree to the terms";
  }

  return errors;
}

/* ── Loading spinner ── */
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

/* ── Error banner ── */
const ErrorBanner = ({ error, onDismiss, onRetry, retryCount = 0 }) => {
  const msg = extractMsg(error);
  if (!msg) return null;
  return (
    <motion.div
      key={msg.slice(0, 30)}
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{    opacity: 0, y: -10, scale: 0.98 }}
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "16px 18px", marginBottom: 24,
        background: "#fef2f2", border: "1.5px solid #fca5a5",
        borderRadius: 14, position: "relative",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: "0 0 10px", fontWeight: 700,
          fontSize: 14, color: "#dc2626",
        }}>
          {msg}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {retryCount < 3 && typeof onRetry === "function" && (
            <button
              type="button" onClick={onRetry}
              style={{
                padding: "7px 16px", borderRadius: 10, border: "none",
                background: "#dc2626", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              🔄 Try Again
            </button>
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
          >
            💬 WhatsApp Support
          </a>
        </div>
      </div>
      <button
        type="button" onClick={onDismiss}
        aria-label="Dismiss error"
        style={{
          position: "absolute", top: 10, right: 12,
          background: "none", border: "none",
          color: "#9ca3af", fontSize: 22,
          cursor: "pointer", lineHeight: 1, padding: 0,
        }}
      >×</button>
    </motion.div>
  );
};

/* ── Shake animation wrapper for validation feedback ── */
const ShakeWrapper = ({ shake, children }) => (
  <motion.div
    animate={shake ? {
      x: [-10, 10, -10, 10, -6, 6, -3, 3, 0],
    } : { x: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   BOOKING WIZARD
══════════════════════════════════════════════════════════════ */
const BookingWizard = ({ successMode = false }) => {
  const navigate      = useNavigate();
  const { stepSlug }  = useParams();

  /* ── Persistence ── */
  const persistence = useBookingPersistence();

  /* ── Remote data (destinations, etc.) ── */
  const wizard = useBookingWizard();

  /* ── Local merged form state ── */
  const [localFormData, setLocalFormDataRaw] = useState(
    () => ({ ...persistence.DEFAULT_FORM, ...persistence.formData }),
  );

  /* Merge wizard's pre-filled data (e.g. user email) once loaded */
  const mergedOnce = useRef(false);
  useEffect(() => {
    if (!wizard.loadingData && wizard.formData && !mergedOnce.current) {
      mergedOnce.current = true;
      setLocalFormDataRaw((prev) => ({
        ...prev,
        // Only fill blanks from wizard (don't overwrite user-typed values)
        ...(wizard.formData.email    && !prev.email    ? { email:     wizard.formData.email    } : {}),
        ...(wizard.formData.firstName && !prev.firstName ? { firstName: wizard.formData.firstName } : {}),
        ...(wizard.formData.lastName  && !prev.lastName  ? { lastName:  wizard.formData.lastName  } : {}),
        ...(wizard.formData.phone     && !prev.phone     ? { phone:     wizard.formData.phone     } : {}),
      }));
    }
  }, [wizard.loadingData, wizard.formData]);

  /* Unified setter — persists + syncs everywhere */
  const setFormData = useCallback((updater) => {
    setLocalFormDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistence.setFormData(next);   // debounced localStorage save
      wizard.setFormData?.(next);      // keep wizard in sync if needed
      return next;
    });
  }, [persistence, wizard]);

  /* ── Derive step from URL slug ── */
  const currentStep = useMemo(() => {
    if (successMode) return -1;
    const step = pathToStep(stepSlug);
    // pathToStep returns 0 for unknown slugs — that's fine
    return step;
  }, [stepSlug, successMode]);

  /* ── Validation state ── */
  const [stepErrors,  setStepErrors]  = useState({});
  const [stepTouched, setStepTouched] = useState({});
  const [shake,       setShake]       = useState(false);

  /* ── Submit state ── */
  const [submitError,   setSubmitError]   = useState(null);
  const [retryCount,    setRetryCount]    = useState(0);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isSubmitted,   setIsSubmitted]   = useState(false);
  const [submissionRef, setSubmissionRef] = useState(null);
  const [bookingEmail,  setBookingEmail]  = useState(null);

  /* ── Resume banner ── */
  const [showResume, setShowResume] = useState(persistence.hasSavedData);

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
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const sectionPadding = isMobile ? "32px 14px 80px"
    : isTablet ? "44px 24px 100px"
    : "64px 32px 120px";

  const cardPadding = isMobile ? "24px 16px"
    : isTablet ? "40px 32px"
    : "52px 64px";

  /* ── Navigation helpers ── */
  const goToStep = useCallback((step) => {
    const path = stepToPath(step);
    navigate(`/booking/${path}`);
    persistence.setCurrentStep(step);
    // Smooth scroll to top of card
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, [navigate, persistence]);

  /* ── Step-click guard (progress stepper) ── */
  const handleStepClick = useCallback((targetStep) => {
    // Always allow going back
    if (targetStep < currentStep) {
      goToStep(targetStep);
      return;
    }
    // Validate intermediate steps before jumping forward
    for (let s = currentStep; s < targetStep; s++) {
      const errs = validateStep(s, localFormData);
      if (Object.keys(errs).length > 0) {
        setStepErrors(errs);
        setStepTouched(
          Object.fromEntries(Object.keys(errs).map((k) => [k, true])),
        );
        triggerShake();
        return;
      }
    }
    setStepErrors({});
    setStepTouched({});
    goToStep(targetStep);
  }, [currentStep, localFormData, goToStep]);

  /* ── Shake helper ── */
  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  /* ── NEXT STEP — this is what the button calls ── */
  const nextStep = useCallback(() => {
    // Validate current step
    const errs = validateStep(currentStep, localFormData);

    if (Object.keys(errs).length > 0) {
      // Show errors + shake
      setStepErrors(errs);
      setStepTouched(
        Object.fromEntries(Object.keys(errs).map((k) => [k, true])),
      );
      triggerShake();
      return; // ← stay on current step
    }

    // Clear errors and advance
    setStepErrors({});
    setStepTouched({});

    const nextStepIndex = currentStep + 1;

    // Steps 0-3 exist (trip=0, travelers=1, review=2, contact=3)
    if (nextStepIndex <= 3) {
      goToStep(nextStepIndex);
    }
  }, [currentStep, localFormData, goToStep, triggerShake]);

  /* ── PREV STEP ── */
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  /* ── Field change handler ── */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear that field's error on change
    setStepErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, [setFormData]);

  /* ── Field blur handler ── */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setStepTouched((prev) => ({ ...prev, [name]: true }));

    // Re-validate that field on blur
    const errs = validateStep(currentStep, localFormData);
    if (errs[name]) {
      setStepErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  }, [currentStep, localFormData]);

  /* ── Interest toggle ── */
  const handleInterestToggle = useCallback((val) => {
    setFormData((prev) => ({
      ...prev,
      interests: (prev.interests || []).includes(val)
        ? (prev.interests || []).filter((i) => i !== val)
        : [...(prev.interests || []), val],
    }));
  }, [setFormData]);

  /* ── Computed helpers passed to steps ── */
  const getTripDuration = useCallback(() => {
    if (!localFormData.startDate || !localFormData.endDate) return null;
    const d = Math.round(
      (new Date(localFormData.endDate) - new Date(localFormData.startDate)) / 86400000,
    );
    return d > 0 ? d : null;
  }, [localFormData.startDate, localFormData.endDate]);

  const getTotalVisitors = useCallback(() =>
    (parseInt(localFormData.adults,   10) || 0) +
    (parseInt(localFormData.children, 10) || 0) +
    (parseInt(localFormData.infants,  10) || 0),
  [localFormData.adults, localFormData.children, localFormData.infants]);

  /* ── SUBMIT ── */
  const handleSubmit = useCallback(async () => {
    const errs = validateStep(3, localFormData);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      setStepTouched(
        Object.fromEntries(Object.keys(errs).map((k) => [k, true])),
      );
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Call the actual wizard submit with merged data
      const result = await wizard.handleSubmit?.(localFormData);

      const ref = result?.ref
        || result?.id
        || result?.bookingId
        || wizard.submissionRef
        || null;

      persistence.clearStorage();
      setBookingEmail(localFormData.email);
      setSubmissionRef(ref);
      setIsSubmitted(true);
      navigate("/booking/success", { replace: true });
    } catch (err) {
      setSubmitError(err);
      setRetryCount((c) => c + 1);
    } finally {
      setIsSubmitting(false);
    }
  }, [localFormData, wizard, persistence, navigate, triggerShake]);

  /* ── Resume handlers ── */
  const handleResume = useCallback(() => {
    setShowResume(false);
    // Navigate to where they left off
    const savedStep = persistence.currentStep ?? 0;
    goToStep(savedStep);
  }, [persistence.currentStep, goToStep]);

  const handleStartFresh = useCallback(() => {
    persistence.clearStorage();
    setLocalFormDataRaw(persistence.DEFAULT_FORM);
    setStepErrors({});
    setStepTouched({});
    setShowResume(false);
    navigate("/booking/trip", { replace: true });
  }, [persistence, navigate]);

  /* ── STEP META ── */
  const STEPS_META = STEP_ROUTES.map((r) => ({ label: r.label, path: r.path }));

  /* ── Which view to render ── */
  const isContactStep = currentStep === 3;
  // Steps 0, 1, 2 → BookingSteps; Step 3 → BookingContact
  const showSteps   = !successMode && !isSubmitted && !isContactStep;
  const showContact = !successMode && !isSubmitted &&  isContactStep;
  const showSuccess = successMode  ||  isSubmitted;

  /* ══════════════════════════════════════════
     LOADING
  ══════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════
     SUCCESS
  ══════════════════════════════════════════ */
  if (showSuccess) {
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
          <div style={{
            maxWidth: 680, margin: "0 auto",
            position: "relative", zIndex: 1,
          }}>
            <GlassCard glow style={{ padding: isMobile ? "28px 18px" : "48px 52px" }}>
              <SuccessScreen
                isMobile={isMobile}
                displayName={wizard.displayName}
                submissionRef={submissionRef || wizard.submissionRef}
                bookingEmail={bookingEmail || localFormData?.email}
              />
            </GlassCard>
          </div>
        </section>
      </>
    );
  }

  /* ══════════════════════════════════════════
     MAIN BOOKING FORM
  ══════════════════════════════════════════ */
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

      <section
        style={{
          padding: sectionPadding,
          backgroundColor: "#f0fdf4",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
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
            borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
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
            borderRadius: "40% 60% 70% 30%/40% 50% 60% 50%",
            background: "linear-gradient(135deg,rgba(16,185,129,.05),rgba(52,211,153,.02))",
            filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
          }}
        />

        <div style={{
          maxWidth: 1020, margin: "0 auto",
          position: "relative", zIndex: 1,
        }}>

          {/* WhatsApp banner */}
          <AnimatedSection animation="fadeInUp">
            <WhatsAppContactBanner isMobile={isMobile} />
          </AnimatedSection>

          {/* Resume banner */}
          <AnimatePresence>
            {showResume && persistence.hasSavedData && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{    opacity: 0, height: 0,    marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <ResumeBanner
                  savedAt={persistence.savedAt}
                  step={persistence.currentStep}
                  stepLabel={STEP_ROUTES[persistence.currentStep]?.label}
                  onResume={handleResume}
                  onStartFresh={handleStartFresh}
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

          {/* Main card */}
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <ShakeWrapper shake={shake}>
              <GlassCard glow style={{ padding: cardPadding }}>

                {/* Global error */}
                <AnimatePresence>
                  {submitError && (
                    <ErrorBanner
                      error={submitError}
                      onDismiss={() => setSubmitError(null)}
                      onRetry={() => {
                        setSubmitError(null);
                        handleSubmit();
                      }}
                      retryCount={retryCount}
                    />
                  )}
                </AnimatePresence>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isContactStep) handleSubmit();
                  }}
                  noValidate
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`step-${currentStep}`}
                      initial={{ opacity: 0, x: 40  }}
                      animate={{ opacity: 1, x: 0   }}
                      exit={{    opacity: 0, x: -40 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    >
                      {/* ── Steps 0, 1, 2 ── */}
                      {showSteps && (
                        <BookingSteps
                          currentStep={currentStep}
                          formData={localFormData}
                          setFormData={setFormData}
                          errors={stepErrors}
                          touched={stepTouched}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          isMobile={isMobile}
                          isTablet={isTablet}
                          displayName={wizard.displayName}
                          categoriesList={wizard.categoriesList  || []}
                          destinationsList={wizard.destinationsList || []}
                          countriesList={wizard.countriesList    || []}
                          servicesData={wizard.servicesData      || []}
                          getTripDuration={getTripDuration}
                          groupTypes={wizard.groupTypes          || []}
                          accommodationTypes={wizard.accommodationTypes || []}
                          getTotalVisitors={getTotalVisitors}
                          interests={wizard.interests            || []}
                          handleInterestToggle={handleInterestToggle}
                          nextStep={nextStep}   /* ← passed correctly */
                          prevStep={prevStep}   /* ← passed correctly */
                          handleStepClick={handleStepClick}
                          isSubmitting={isSubmitting}
                        />
                      )}

                      {/* ── Step 3: Contact ── */}
                      {showContact && (
                        <BookingContact
                          formData={localFormData}
                          setFormData={setFormData}
                          errors={stepErrors}
                          touched={stepTouched}
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
                          onSubmit={handleSubmit}   /* ← submit handler */
                          prevStep={prevStep}        /* ← back navigation */
                          isMobile={isMobile}
                          submitError={submitError}
                          destinationsList={wizard.destinationsList || []}
                          groupTypes={wizard.groupTypes          || []}
                          countriesList={wizard.countriesList    || []}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </form>

              </GlassCard>
            </ShakeWrapper>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <div style={{
              display: "flex", justifyContent: "center",
              alignItems: "center",
              gap: isMobile ? 12 : 32,
              marginTop: isMobile ? 24 : 40,
              flexWrap: "wrap",
            }}>
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0  }}
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