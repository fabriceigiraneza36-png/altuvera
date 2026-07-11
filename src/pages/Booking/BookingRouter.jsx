// src/pages/Booking/BookingRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BookingWizard from "./BookingWizard";
import BookingShell  from "./BookingShell";   // ← new shared wrapper

export const STEP_ROUTES = [
  { path: "trip",      step: 0, label: "Trip Details" },
  { path: "travelers", step: 1, label: "Travelers"    },
  { path: "review",    step: 2, label: "Review"       },
  { path: "contact",   step: 3, label: "Contact"      },
];

export const stepToPath = (step) => {
  const found = STEP_ROUTES.find((r) => r.step === step);
  return found ? found.path : "trip";
};

export const pathToStep = (slug) => {
  if (!slug) return 0;
  const found = STEP_ROUTES.find((r) => r.path === slug);
  return found !== undefined ? found.step : 0;
};

/**
 * BookingShell owns ALL shared state.
 * BookingWizard receives step as a prop — no remounting issues.
 */
const BookingRouter = () => (
  <Routes>
    <Route element={<BookingShell />}>
      <Route index                  element={<Navigate to="trip" replace />} />
      <Route path="trip"            element={<BookingWizard step={0} />} />
      <Route path="travelers"       element={<BookingWizard step={1} />} />
      <Route path="review"          element={<BookingWizard step={2} />} />
      <Route path="contact"         element={<BookingWizard step={3} />} />
      <Route path="success"         element={<BookingWizard step={-1} successMode />} />
      <Route path="*"               element={<Navigate to="trip" replace />} />
    </Route>
  </Routes>
);

export default BookingRouter;