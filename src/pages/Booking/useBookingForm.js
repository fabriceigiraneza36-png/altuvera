import { useBookingContext } from "./BookingContext";

export const STEPS = [
  { id: "identity",    label: "Identity",    desc: "Tell us about yourself" },
  { id: "destination", label: "Destination", desc: "Where you're going" },
  { id: "trip",        label: "Trip",        desc: "When & how many" },
  { id: "contact",     label: "Send",        desc: "Final details" },
];

/**
 * Thin wrapper over BookingContext so existing imports keep working.
 * Form state now lives in BookingProvider and persists across step routes.
 */
export function useBookingForm() {
  const ctx = useBookingContext();
  return ctx;
}
