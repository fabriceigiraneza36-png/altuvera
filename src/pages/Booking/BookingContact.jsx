// src/pages/Booking/BookingContact.jsx
import React from "react";
import { motion } from "framer-motion";
import StepFour from "./components/StepFour";
import TripSummary from "./components/TripSummary";
import ProfileImageUpload from "./components/ProfileImageUpload";
import { THEME } from "./BookingShared";

const BookingContact = ({
  isMobile,
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  getTripDuration, getTotalVisitors, getDestinationName,
  accommodationTypes,
  user, displayName, isAuthenticated, openModal,
  isSubmitting, onSubmit,
  prevStep,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -36 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Profile image upload */}
      <ProfileImageUpload
        user={user}
        formData={formData}
        setFormData={setFormData}
        isMobile={isMobile}
      />

      {/* Trip summary */}
      <TripSummary
        formData={formData}
        getTripDuration={getTripDuration}
        getTotalVisitors={getTotalVisitors}
        getDestinationName={getDestinationName}
        accommodationTypes={accommodationTypes}
        isMobile={isMobile}
      />

      {/* Auth status */}
      {!isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 24,
            padding: "18px 20px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #D1FAE5, #ECFDF5)",
            border: "1px solid #6EE7B7",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#064E3B", marginBottom: 4 }}>
              Sign in to auto-fill your details
            </div>
            <div style={{ fontSize: 13, color: "#065F46" }}>
              Faster booking with your saved information.
            </div>
          </div>
          <motion.button
            type="button"
            onClick={() => openModal("login")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "11px 22px", borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryLight})`,
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 6px 18px rgba(5,150,105,0.28)",
              flexShrink: 0,
            }}
          >
            Sign In
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 24,
            padding: "14px 18px",
            borderRadius: 14,
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            color: "#166534",
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 18 }}>✅</span>
          Signed in as <strong>{user?.fullName || user?.name || user?.email}</strong>. Details auto-filled.
        </motion.div>
      )}

      {/* Step 4 form fields */}
      <StepFour
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        getTripDuration={getTripDuration}
        getTotalVisitors={getTotalVisitors}
        getDestinationName={getDestinationName}
        accommodationTypes={accommodationTypes}
        user={user}
        isMobile={isMobile}
        displayName={displayName}
        isAuthenticated={isAuthenticated}
        openModal={openModal}
      />

      {/* Navigation + Submit */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 28,
          borderTop: `2px solid ${THEME.gray100}`,
          display: "flex",
          flexDirection: isMobile ? "column-reverse" : "row",
          gap: 14,
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
        }}
      >
        {/* Back button */}
        <motion.button
          type="button"
          onClick={prevStep}
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

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          onClick={onSubmit}
          whileHover={!isSubmitting ? { scale: 1.02, boxShadow: "0 14px 36px rgba(37,211,102,0.45)" } : {}}
          whileTap={!isSubmitting ? { scale: 0.97 } : {}}
          style={{
            flex: 1,
            maxWidth: isMobile ? "100%" : 400,
            padding: isMobile ? "16px 24px" : "17px 28px",
            borderRadius: 16, border: "none",
            background: isSubmitting
              ? "linear-gradient(135deg, #9CA3AF, #6B7280)"
              : "linear-gradient(135deg, #25D366, #128C7E)",
            color: "white",
            fontSize: isMobile ? 15 : 16,
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: isSubmitting ? "none" : "0 8px 24px rgba(37,211,102,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontFamily: "inherit",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isSubmitting ? (
            <>
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity=".2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </motion.svg>
              Submitting your booking…
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Submit via WhatsApp
            </>
          )}
        </motion.button>
      </div>

      {/* Privacy note */}
      <p style={{
        textAlign: "center", marginTop: 16,
        fontSize: 12, color: THEME.gray400,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Your information is secure and will only be used to process your booking.
      </p>
    </motion.div>
  );
};

export default BookingContact;