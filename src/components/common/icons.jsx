import React from "react";
import {
  Calendar,
  ChevronDown,
  Clock3,
  Compass,
  Mail,
  MapPin,
  Mountain,
  Star,
} from "lucide-react";

const ICONS = {
  calendar: Calendar,
  mapPin: MapPin,
  compass: Compass,
  mountain: Mountain,
  clock: Clock3,
  star: Star,
  mail: Mail,
  chevDown: ChevronDown,
};

export const Ic = ({ n, size = 16, style = {}, ...props }) => {
  const Icon = ICONS[n] || Mountain;
  return <Icon size={size} {...props} style={{ flexShrink: 0, ...style }} />;
};

export default Ic;
