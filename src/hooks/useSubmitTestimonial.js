// src/hooks/useSubmitTestimonial.js
import { useState, useCallback } from "react";
import enhancedApiClient from "../utils/enhancedApiClient";

const countWords = (str = "") =>
  str.trim().split(/\s+/).filter(Boolean).length;

/**
 * Hook for submitting a user review from the public-facing form.
 * Handles client-side validation, word count, and API call.
 */
export function useSubmitTestimonial({ onSuccess } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState(null);

  const submit = useCallback(async (formData) => {
    setError(null);

    const text = (formData.testimonial_text || "").trim();
    if (!text) {
      setError("Please write your review before submitting.");
      return false;
    }

    const wc = countWords(text);
    if (wc > 60) {
      setError(`Review must be 60 words or fewer (currently ${wc} words).`);
      return false;
    }

    const rating = parseInt(formData.rating || 5);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return false;
    }

    setSubmitting(true);
    try {
      const result = await enhancedApiClient.request("/testimonials/submit", {
        method: "POST",
        body:   JSON.stringify({
          testimonial_text: text,
          rating,
          trip:     (formData.trip     || "").trim() || undefined,
          location: (formData.location || "").trim() || undefined,
        }),
      });

      if (result?.success === false) {
        throw new Error(result?.error || result?.message || "Submission failed.");
      }

      setSubmitted(true);
      onSuccess?.(result?.data);
      return true;
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [onSuccess]);

  const reset = useCallback(() => {
    setSubmitted(false);
    setError(null);
  }, []);

  return {
    submit,
    submitting,
    submitted,
    error,
    reset,
    countWords,
  };
}