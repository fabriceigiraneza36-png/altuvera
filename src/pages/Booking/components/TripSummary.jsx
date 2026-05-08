import React, { memo } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiCalendar, FiUsers, FiHome, FiCheckCircle } from "react-icons/fi";
import { THEME, normalizeOptionValue } from "../BookingShared";

const TripSummary = memo(
  ({
    formData,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,
    accommodationTypes,
    isMobile,
  }) => {
    const items = [
      {
        icon: FiMapPin,
        label: "Destination",
        value: getDestinationName(),
      },
      {
        icon: FiCalendar,
        label: "Duration",
        value: getTripDuration() || "Not set",
      },
      {
        icon: FiUsers,
        label: "Travelers",
        value: `${getTotalVisitors()} ${getTotalVisitors() === 1 ? "person" : "people"}`,
      },
      {
        icon: FiHome,
        label: "Accommodation",
        value:
          accommodationTypes.find((a) => a.id === formData.accommodation)
            ?.name || "Not selected",
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: isMobile ? 20 : 28,
          background: `linear-gradient(135deg, ${THEME.background} 0%, ${THEME.backgroundAlt} 100%)`,
          borderRadius: 22,
          border: `2px solid ${THEME.primaryLighter}`,
          marginBottom: isMobile ? 28 : 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            color: THEME.primaryDark,
          }}
        >
          <FiCheckCircle size={20} />
          Your Trip Summary
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: isMobile ? 14 : 18,
          }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: THEME.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  flexShrink: 0,
                }}
              >
                <item.icon size={18} color={THEME.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: THEME.textLight,
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 700,
                    color: THEME.primaryDark,
                  }}
                >
                  {item.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  },
);

export default TripSummary;
