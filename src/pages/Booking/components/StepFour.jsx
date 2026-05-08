import React, { memo } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiGlobe, FiSettings, FiClock, FiDollarSign, FiCreditCard, FiMapPin, FiCompass, FiMessageSquare } from "react-icons/fi";
import { THEME } from "../BookingShared";
import { FormInput, FormSelect } from "./FormComponents";

const StepFour = memo(
  ({
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
    isMobile,
    displayName,
    isAuthenticated,
    openModal,
  }) => {
    const getPersonalizedContactMessage = () => {
      if (displayName) {
        return `Almost there, ${displayName}! Let's finalize your booking details and get you ready for an unforgettable adventure.`;
      }
      return "Almost there! Let's finalize your booking details and get you ready for an unforgettable adventure.";
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 12px 32px ${THEME.shadowDark}`,
            }}
          >
            <FiUser size={30} color="white" />
          </motion.div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 26 : 36,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 10,
            }}
          >
            Almost <span style={{ color: THEME.primary }}>There!</span>
          </h2>
          <p
            style={{
              fontSize: isMobile ? 14 : 16,
              color: THEME.textLight,
              lineHeight: 1.6,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            {getPersonalizedContactMessage()}
          </p>
        </div>

        {/* Auto-filled info section */}
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
                backgroundColor: THEME.primary,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <FiUser size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: THEME.text,
                }}
              >
                Auto-filled contact details
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: THEME.textLight,
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
                border: `1px solid ${THEME.gray200}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: THEME.textLight,
                  marginBottom: 6,
                }}
              >
                Full name
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: THEME.text,
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
                border: `1px solid ${THEME.gray200}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: THEME.textLight,
                  marginBottom: 6,
                }}
              >
                Email address
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: THEME.text,
                }}
              >
                {formData.email || 'Enter your email'}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 20 : 24,
          }}
        >
          <FormInput
            name="name"
            label="Full Name"
            placeholder="John Smith"
            required
            icon={FiUser}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            isMobile={isMobile}
          />

          <FormInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            isMobile={isMobile}
          />

          <FormInput
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 8900"
            required
            icon={FiPhone}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
            isMobile={isMobile}
          />

          <FormInput
            name="country"
            label="Your Country"
            placeholder="United States"
            required
            icon={FiGlobe}
            value={formData.country}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.country}
            touched={touched.country}
            isMobile={isMobile}
          />
        </div>

        <div style={{ marginTop: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: THEME.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiSettings size={18} color={THEME.primary} />
            </div>
            Travel Preferences (Optional)
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 20 : 24,
            }}
          >
            <FormSelect
              name="preferredContactMethod"
              label="Preferred Contact"
              options={[
                { value: "whatsapp", name: "WhatsApp" },
                { value: "email", name: "Email" },
                { value: "phone", name: "Phone Call" },
              ]}
              icon={FiMessageSquare}
              value={formData.preferredContactMethod}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.preferredContactMethod}
              error={errors.preferredContactMethod}
              isMobile={isMobile}
            />

            <FormInput
              name="preferredContactTime"
              label="Best Time to Reach You"
              placeholder="e.g. 9am–12pm (GMT+2)"
              icon={FiClock}
              value={formData.preferredContactTime}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.preferredContactTime}
              error={errors.preferredContactTime}
              isMobile={isMobile}
              helpText="Add your timezone for faster replies."
            />

            <FormInput
              name="budgetPerPerson"
              label="Budget Per Person"
              type="number"
              placeholder="e.g. 2500"
              icon={FiDollarSign}
              value={formData.budgetPerPerson}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.budgetPerPerson}
              error={errors.budgetPerPerson}
              isMobile={isMobile}
            />

            <FormSelect
              name="currency"
              label="Currency"
              options={[
                { value: "USD", name: "USD" },
                { value: "EUR", name: "EUR" },
                { value: "GBP", name: "GBP" },
                { value: "ZAR", name: "ZAR" },
                { value: "KES", name: "KES" },
                { value: "TZS", name: "TZS" },
                { value: "UGX", name: "UGX" },
                { value: "RWF", name: "RWF" },
              ]}
              icon={FiCreditCard}
              value={formData.currency}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.currency}
              error={errors.currency}
              isMobile={isMobile}
            />

            <FormInput
              name="pickupLocation"
              label="Pickup Location (If Known)"
              placeholder="Hotel / Airport / City"
              icon={FiMapPin}
              value={formData.pickupLocation}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.pickupLocation}
              error={errors.pickupLocation}
              isMobile={isMobile}
            />

            <FormSelect
              name="marketingSource"
              label="How Did You Find Us?"
              options={[
                { value: "google", name: "Google Search" },
                { value: "instagram", name: "Instagram" },
                { value: "tiktok", name: "TikTok" },
                { value: "facebook", name: "Facebook" },
                { value: "referral", name: "Friend/Referral" },
                { value: "returning", name: "Returning Traveler" },
                { value: "other", name: "Other" },
              ]}
              icon={FiCompass}
              value={formData.marketingSource}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.marketingSource}
              error={errors.marketingSource}
              isMobile={isMobile}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: THEME.text,
              }}
            >
              <input
                type="checkbox"
                checked={!!formData.newsletterOptIn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletterOptIn: e.target.checked,
                  }))
                }
                style={{ transform: "translateY(1px)" }}
              />
              Email me destination updates and travel tips.
            </label>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginTop: 28 }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: isMobile ? 13 : 14,
              fontWeight: 600,
              color: THEME.text,
              marginBottom: 10,
            }}
          >
            <FiMessageSquare size={16} style={{ color: THEME.primary }} />
            Special Requests or Questions
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requirements, dietary needs, celebrations, or questions..."
            style={{
              width: "100%",
              padding: isMobile ? "14px 16px" : "18px 22px",
              fontSize: isMobile ? 16 : 15,
              border: `2px solid ${THEME.gray200}`,
              borderRadius: 16,
              backgroundColor: THEME.gray50,
              outline: "none",
              resize: "vertical",
              minHeight: isMobile ? 110 : 130,
              fontFamily: "inherit",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = THEME.primary;
              e.target.style.backgroundColor = THEME.white;
              e.target.style.boxShadow = `0 0 0 4px rgba(5, 150, 105, 0.08)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = THEME.gray200;
              e.target.style.backgroundColor = THEME.gray50;
              e.target.style.boxShadow = "none";
            }}
          />
        </motion.div>

        {/* WhatsApp Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            marginTop: 28,
            padding: isMobile ? 18 : 24,
            background: `linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(5, 150, 105, 0.06) 100%)`,
            borderRadius: 18,
            border: "1px solid rgba(37, 211, 102, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 6px 20px rgba(37, 211, 102, 0.3)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: isMobile ? 14 : 15,
                fontWeight: 700,
                color: THEME.primaryDark,
                marginBottom: 4,
              }}
            >
              Your request will be sent via WhatsApp
            </div>
            <p
              style={{
                fontSize: isMobile ? 12 : 13,
                color: THEME.textLight,
                margin: 0,
              }}
            >
              IGIRANEZA Fabrice will respond within 24 hours with a
              personalized quote
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);

export default StepFour;
