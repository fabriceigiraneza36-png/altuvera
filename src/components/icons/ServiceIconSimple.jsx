import React from 'react';
import { FiMapPin, FiCamera, FiUsers, FiCompass, FiHeart, FiSun, FiActivity } from 'react-icons/fi';

// Professional, dependable icon mapper using Feather icons (transparent SVG)
export const ServiceIconSimple = ({ name, size = 20, color = 'currentColor', ...props }) => {
  const map = {
    safari: FiMapPin,
    mountain: FiActivity,
    primate: FiMapPin,
    beach: FiSun,
    culture: FiHeart,
    photography: FiCamera,
    adventure: FiCompass,
    group: FiUsers,
  };

  const Icon = map[name] || FiMapPin;
  return <Icon size={size} color={color} {...props} />;
};

export default ServiceIconSimple;
