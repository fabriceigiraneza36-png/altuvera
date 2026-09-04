import { useDestinationLikes } from "./useDestinationLikes";

export function useCountryLikes(countryId) {
  return useDestinationLikes(countryId, "country");
}