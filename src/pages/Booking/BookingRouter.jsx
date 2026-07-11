// src/pages/Booking/BookingRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BookingShell  from "./BookingShell";
import BookingWizard from "./BookingWizard";

export const STEP_ROUTES = [
  { path: "trip",     step: 0, label: "Trip Details" },
  { path: "travelers",step: 1, label: "Travellers"   },
  { path: "contact",  step: 2, label: "Contact"      },
  { path: "review",   step: 3, label: "Review"       },
];

export const stepToPath = (step) =>
  STEP_ROUTES.find((r) => r.step === step)?.path ?? "trip";

export const pathToStep = (slug) =>
  STEP_ROUTES.find((r) => r.path === slug)?.step ?? 0;

const BookingRouter = () => (
  <Routes>
    {/* BookingShell owns all shared state — rendered once */}
    <Route element={<BookingShell />}>
      <Route index                element={<Navigate to="trip" replace />} />
      <Route path="trip"          element={<BookingWizard step={0} />} />
      <Route path="travelers"     element={<BookingWizard step={1} />} />
      <Route path="contact"       element={<BookingWizard step={2} />} />
      <Route path="review"        element={<BookingWizard step={3} />} />
      <Route path="success"       element={<BookingWizard step={-1} successMode />} />
      <Route path="*"             element={<Navigate to="trip" replace />} />
    </Route>
  </Routes>
);

export default BookingRouter;