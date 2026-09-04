import { useDestinationComments } from "./useDestinationComments";

export function useCountryComments(countryId) {
  return useDestinationComments(countryId, "country");
}