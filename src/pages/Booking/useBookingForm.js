import { useBookingContext } from "./BookingContext";
import { STEPS } from "./BookingShared";
export { STEPS };

export function useBookingForm() {
  return useBookingContext();
}
