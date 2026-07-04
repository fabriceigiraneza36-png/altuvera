import React from 'react';
import { 
  FiSunrise,    // Safari - evokes African sunrise/wildlife viewing
  FiTriangle,   // Mountain - represents peaks
  FiEye,        // Primate - watching/tracking wildlife
  FiAnchor,     // Beach - coastal/marine
  FiGlobe,      // Culture - world cultures/heritage
  FiAperture,   // Photography - camera aperture (more pro)
  FiNavigation, // Adventure - direction/exploration
  FiUsers,      // Group - people/team
  FiMap,        // Default fallback
  FiFeather,    // Wildlife alternative
  FiStar,       // Luxury/premium
  FiCalendar,   // Booking/scheduling
  FiClock,      // Duration/time
  FiShield,     // Safety/trust
  FiAward       // Quality/certification
} from 'react-icons/fi';

// Professional icon mapper with refined icon selections
export const ServiceIconSimple = ({ 
  name, 
  size = 20, 
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props 
}) => {
  const iconMap = {
    // Core Services
    safari: FiSunrise,
    mountain: FiTriangle,
    primate: FiEye,
    beach: FiAnchor,
    culture: FiGlobe,
    photography: FiAperture,
    adventure: FiNavigation,
    group: FiUsers,
    
    // Additional Options
    wildlife: FiFeather,
    luxury: FiStar,
    booking: FiCalendar,
    duration: FiClock,
    safety: FiShield,
    certified: FiAward,
    location: FiMap,
  };

  const Icon = iconMap[name?.toLowerCase()] || FiMap;
  
  return (
    <Icon 
      size={size} 
      color={color} 
      strokeWidth={strokeWidth}
      {...props} 
    />
  );
};

export default ServiceIconSimple;