// src/pages/Booking/BookingSteps.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";
import { THEME } from "./BookingShared";

const NAV_TRANSITION = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

const BookingSteps = ({
  currentStep,
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  isMobile, displayName,
  categoriesList, destinationsList, countriesList, servicesData,
  getTripDuration, groupTypes, accommodationTypes, getTotalVisitors,
  interests, handleInterestToggle,
  nextStep, prevStep,
}) => {
  const commonProps = {
    formData, setFormData,
    errors, touched,
    handleChange, handleBlur,
    isMobile,
  };

  return (
    <>
      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={NAV_TRANSITION}
          >
            <StepOne
              {...commonProps}
              categoriesList={categoriesList}
              destinationsList={destinationsList}
              countriesList={countriesList}
              servicesData={servicesData}
              getTripDuration={getTripDuration}
              displayName={displayName}
            />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={NAV_TRANSITION}
          >
            <StepTwo
              {...commonProps}
              groupTypes={groupTypes}
              accommodationTypes={accommodationTypes}
              getTotalVisitors={getTotalVisitors}
              displayName={displayName}
            />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={NAV_TRANSITION}
          >
            <StepThree
              {...commonProps}
              interests={interests}
              handleInterestToggle={handleInterestToggle}
              displayName={displayName}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation — shown for all steps 1-3 */}
      <NavButtons
        currentStep={currentStep}
        onNext={nextStep}
        onPrev={prevStep}
        isMobile={isMobile}
      />
    </>
  );
};

/* ── Navigation buttons ── */
const NavButtons = ({ currentStep, onNext, onPrev, isMobile }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    style={{
      display: "flex",
      justifyContent: currentStep > 1 ? "space-between" : "flex-end",
      alignItems: isMobile ? "stretch" : "center",
      flexDirection: isMobile ? "column-reverse" : "row",
      marginTop: isMobile ? 36 : 50,
      paddingTop: isMobile ? 26 : 34,
      borderTop: `2px solid ${THEME.gray100}`,
      gap: 12,
    }}
  >
    {currentStep > 1 && (
      <motion.button
        type="button"
        onClick={onPrev}
        whileHover={{ backgroundColor: THEME.gray50, borderColor: THEME.gray300, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: isMobile ? "14px 22px" : "16px 30px",
          borderRadius: 16,
          border: `2px solid ${THEME.gray200}`,
          backgroundColor: "transparent",
          color: THEME.gray700,
          fontSize: isMobile ? 14 : 15,
          fontWeight: 600,
          cursor: "pointer",
          width: isMobile ? "100%" : "auto",
          fontFamily: "inherit",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Previous
      </motion.button>
    )}

    <motion.button
      type="button"
      onClick={onNext}
      whileHover={{ boxShadow: `0 12px 32px rgba(5,150,105,0.38)`, scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: isMobile ? "14px 22px" : "16px 36px",
        borderRadius: 16, border: "none",
        background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
        color: "white",
        fontSize: isMobile ? 14 : 15,
        fontWeight: 700,
        cursor: "pointer",
        width: isMobile ? "100%" : "auto",
        boxShadow: `0 8px 24px rgba(5,150,105,0.28)`,
        fontFamily: "inherit",
      }}
    >
      Continue to {currentStep === 1 ? "Group Info" : currentStep === 2 ? "Interests" : "Contact Details"}
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </motion.button>
  </motion.div>
);

export default BookingSteps;