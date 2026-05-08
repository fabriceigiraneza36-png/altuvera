import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";
import { THEME } from "./BookingShared";

const BookingSteps = ({
  currentStep,
  isAnimating,
  formData,
  setFormData,
  errors,
  touched,
  handleChange,
  handleBlur,
  isMobile,
  displayName,
  categoriesList,
  destinationsList,
  countriesList,
  servicesData,
  getTripDuration,
  groupTypes,
  accommodationTypes,
  getTotalVisitors,
  interests,
  handleInterestToggle,
  nextStep,
  prevStep,
  handleStepClick,
  isSubmitting,
  handleSubmit,
}) => {
  const renderStepContent = () => {
    const commonProps = {
      formData,
      setFormData,
      errors,
      touched,
      handleChange,
      handleBlur,
      isMobile,
    };

    switch (currentStep) {
      case 1:
        return (
          <StepOne
            {...commonProps}
            categoriesList={categoriesList}
            destinationsList={destinationsList}
            countriesList={countriesList}
            servicesData={servicesData}
            getTripDuration={getTripDuration}
            displayName={displayName}
          />
        );
      case 2:
        return (
          <StepTwo
            {...commonProps}
            groupTypes={groupTypes}
            accommodationTypes={accommodationTypes}
            getTotalVisitors={getTotalVisitors}
            displayName={displayName}
          />
        );
      case 3:
        return (
          <StepThree
            {...commonProps}
            interests={interests}
            handleInterestToggle={handleInterestToggle}
            displayName={displayName}
          />
        );
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          display: "flex",
          justifyContent: currentStep > 1 ? "space-between" : "flex-end",
          alignItems: isMobile ? "stretch" : "center",
          flexDirection: isMobile ? "column-reverse" : "row",
          marginTop: isMobile ? 36 : 50,
          paddingTop: isMobile ? 28 : 36,
          borderTop: `2px solid ${THEME.gray100}`,
          gap: 14,
        }}
      >
        {currentStep > 1 && (
          <motion.button
            type="button"
            onClick={prevStep}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: isMobile ? "15px 24px" : "17px 32px",
              borderRadius: 16,
              border: `2px solid ${THEME.gray200}`,
              backgroundColor: "transparent",
              color: THEME.gray700,
              fontSize: isMobile ? 14 : 16,
              fontWeight: 600,
              cursor: "pointer",
              width: isMobile ? "100%" : "auto",
              transition: "all 0.3s ease",
            }}
            whileHover={{
              backgroundColor: THEME.gray50,
              borderColor: THEME.gray300,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {!isMobile && "Previous"}
          </motion.button>
        )}

        <motion.button
          type="button"
          onClick={nextStep}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: isMobile ? "15px 24px" : "17px 36px",
            borderRadius: 16,
            border: "none",
            background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
            color: "white",
            fontSize: isMobile ? 14 : 16,
            fontWeight: 600,
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
            boxShadow: `0 8px 24px ${THEME.shadowDark}`,
            transition: "all 0.3s ease",
          }}
          whileHover={{
            boxShadow: `0 12px 32px ${THEME.shadowDark}`,
            scale: 1.02,
            y: -2,
          }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={currentStep}>
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {currentStep < 3 && renderNavigationButtons()}
    </>
  );
};

export default BookingSteps;
