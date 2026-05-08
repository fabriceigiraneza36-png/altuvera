import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import BookingSteps from "./Booking/BookingSteps";
import BookingContact from "./Booking/BookingContact";
import GlobalStyles from "./Booking/GlobalStyles";
import FloatingParticles from "./Booking/components/FloatingParticles";
import GlassCard from "./Booking/components/GlassCard";
import MagneticButton from "./Booking/components/MagneticButton";
import ConfettiCelebration from "./Booking/components/ConfettiCelebration";
import { useBookingWizard } from "../hooks/useBookingWizard";
import { STEPS } from "./Booking/BookingShared";
import ProgressStepper from "./Booking/components/ProgressStepper";
import WhatsAppContactBanner from "./Booking/components/WhatsAppContactBanner";
import SuccessScreen from "./Booking/components/SuccessScreen";

const Booking = () => {
  const wizard = useBookingWizard();
  const { user } = wizard;

  // Window size
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading state
  if (wizard.loadingData) {
    return (
      <div>
        <GlobalStyles />
        <PageHeader
          title="Book Your Adventure"
          subtitle="Start planning your East African adventure today."
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding: isMobile ? "40px 20px" : "70px 24px",
            backgroundColor: "#F0FDF4",
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `4px solid #E5E7EB`,
              borderTopColor: "#059669",
            }}
          />
        </section>
      </div>
    );
  }

  // Success state
  if (wizard.isSubmitted) {
    return (
      <div>
        <GlobalStyles />
        <ConfettiCelebration active={true} duration={5000} />
        <PageHeader
          title="Booking Request"
          subtitle="Your adventure awaits!"
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding: isMobile ? "30px 16px 75px" : "60px 24px 100px",
            backgroundColor: "#F0FDF4",
            minHeight: "70vh",
            position: "relative",
          }}
        >
          <FloatingParticles />
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <GlassCard
              glow
              style={{ padding: isMobile ? "20px 20px" : "35px 40px" }}
            >
              <SuccessScreen
                isMobile={isMobile}
                displayName={wizard.displayName}
              />
            </GlassCard>
          </div>
        </section>
      </div>
    );
  }

  // Main booking form
  return (
    <div>
      <GlobalStyles />

      <PageHeader
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: "Booking" }]}
      />

      <section
        style={{
          padding: isMobile
            ? "40px 16px 100px"
            : isTablet
              ? "50px 24px 120px"
              : "80px 24px 140px",
          backgroundColor: "#F0FDF4",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Floating particles */}
        <FloatingParticles />

        {/* Decorative blobs */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 450,
            height: 450,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            background: `linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, rgba(16, 185, 129, 0.03) 100%)`,
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          style={{
            position: "absolute",
            bottom: -130,
            left: -130,
            width: 380,
            height: 380,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background: `linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.02) 100%)`,
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* WhatsApp Contact Banner */}
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
                padding: isMobile
                  ? "30px 22px"
                  : isTablet
                    ? "45px 35px"
                    : "55px 70px",
                opacity: wizard.isAnimating ? 0 : 1,
                transform: wizard.isAnimating
                  ? "translateY(16px)"
                  : "translateY(0)",
                transition: "all 0.25s ease",
                position: "relative",
                zIndex: 2,
                boxShadow:
                  "0 32px 80px rgba(2,44,34,.14), 0 12px 30px rgba(2,44,34,.08)",
              }}
            >
              <form onSubmit={wizard.handleSubmit}>
                {wizard.currentStep < 4 ? (
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
                    isMobile={isMobile}
                  />
                )}
              </form>
            </GlassCard>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <motion.div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: isMobile ? 20 : 40,
                marginTop: isMobile ? 36 : 50,
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: "🛡️", text: "Secure & Verified" },
                { icon: "🏆", text: "Expert Guidance" },
                { icon: "🎧", text: "24/7 WhatsApp Support" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#6B7280",
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Booking;
