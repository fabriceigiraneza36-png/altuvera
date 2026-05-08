import React, { memo } from "react";
import StepFour from "./components/StepFour";
import TripSummary from "./components/TripSummary";
import ProfileImageUpload from "./components/ProfileImageUpload";
import SuccessScreen from "./components/SuccessScreen";

const BookingContact = ({
  isSubmitted,
  isMobile,
  formData,
  setFormData,
  errors,
  touched,
  handleChange,
  handleBlur,
  getTripDuration,
  getTotalVisitors,
  getDestinationName,
  accommodationTypes,
  user,
  displayName,
  isAuthenticated,
  openModal,
  isSubmitting,
  onSubmit,
}) => {
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: "center",
          padding: isMobile ? "50px 20px" : "70px 40px",
        }}
      >
        <SuccessScreen isMobile={isMobile} displayName={displayName} />
      </motion.div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          padding: 22,
          borderRadius: 22,
          background: `linear-gradient(135deg, rgba(5,150,105,0.1), rgba(236,253,245,1) 100%)`,
          border: `1px solid rgba(16, 185, 129, 0.16)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              backgroundColor: '#059669',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1a1a1a',
              }}
            >
              Auto-filled contact details
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#6B7280',
              }}
            >
              We preloaded your name and email from your account for a smoother booking experience.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: '#fff',
              border: `1px solid #E5E7EB`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: '#6B7280',
                marginBottom: 6,
              }}
            >
              Full name
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#1a1a1a',
              }}
            >
              {formData.name || 'Enter your name'}
            </div>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: '#fff',
              border: `1px solid #E5E7EB`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: '#6B7280',
                marginBottom: 6,
              }}
            >
              Email address
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#1a1a1a',
              }}
            >
              {formData.email || 'Enter your email'}
            </div>
          </div>
        </div>
      </div>

      <ProfileImageUpload
        user={user}
        formData={formData}
        setFormData={setFormData}
        isMobile={isMobile}
      />

      <TripSummary
        formData={formData}
        getTripDuration={getTripDuration}
        getTotalVisitors={getTotalVisitors}
        getDestinationName={getDestinationName}
        accommodationTypes={accommodationTypes}
        isMobile={isMobile}
      />

      {!isAuthenticated ? (
        <div
          style={{
            marginBottom: 24,
            padding: 18,
            borderRadius: 20,
            backgroundColor: "#D1FAE5",
            color: "#064E3B",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Sign in to auto-fill your booking contact details.
          </div>
          <button
            type="button"
            onClick={() => openModal("login")}
            style={{
              padding: "12px 20px",
              borderRadius: 16,
              border: "none",
              backgroundColor: "#059669",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Sign in with your account
          </button>
        </div>
      ) : (
        <div
          style={{
            marginBottom: 24,
            padding: 18,
            borderRadius: 20,
            backgroundColor: "#ECFDF5",
            color: "#166534",
          }}
        >
          Signed in as <strong>{user.fullName || user.email}</strong>. Your booking details are synced.
        </div>
      )}

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

      <div style={{ marginTop: 24 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={onSubmit}
          style={{
            width: "100%",
            padding: "15px 24px",
            borderRadius: 16,
            border: "none",
            background: isSubmitting
              ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
              : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            color: "white",
            fontSize: 16,
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: isSubmitting
              ? "none"
              : "0 8px 24px rgba(37, 211, 102, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {isSubmitting ? (
            <>
              <svg
                style={{ animation: "spin 1s linear infinite" }}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Submit via WhatsApp
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingContact;
